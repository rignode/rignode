import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import type { Job } from "@workspace/db";
import { verifyUsdcPayment } from "../lib/solana";

function mapJob(j: Job) {
  return {
    ...j,
    earningUsdc: parseFloat(String(j.earningUsdc)),
    createdAt: j.createdAt.toISOString(),
    completedAt: j.completedAt ? j.completedAt.toISOString() : null,
  };
}

import {
  SubmitJobBody,
  SubmitJobResponse,
  GetJobParams,
  GetJobResponse,
  ListJobsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const MODELS = ["llama3-8b-q4", "llama3-70b-q4", "mistral-7b-q4", "qwen2-7b-q4", "whisper-large-v3"];

const PRICE_PER_OUTPUT_K: Record<string, number> = {
  "llama3-8b-q4":     0.0004,
  "llama3-70b-q4":    0.0016,
  "mistral-7b-q4":    0.0003,
  "qwen2-7b-q4":      0.0003,
  "whisper-large-v3": 0.0006,
};

function estimateTokens(prompt: string) {
  return Math.max(10, Math.floor(prompt.length / 4));
}

router.get("/jobs", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
  res.json(ListJobsResponse.parse(jobs.map(mapJob)));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = SubmitJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!MODELS.includes(parsed.data.model)) {
    res.status(400).json({ error: `Model must be one of: ${MODELS.join(", ")}` });
    return;
  }

  const inputTokens  = estimateTokens(parsed.data.prompt);
  const outputTokens = Math.floor(inputTokens * 1.5);
  const pricePerK    = PRICE_PER_OUTPUT_K[parsed.data.model] ?? 0.0004;
  const earningUsdc  = ((outputTokens / 1000) * pricePerK * 0.8).toFixed(6);

  const txSignature = typeof req.body.txSignature === "string" ? req.body.txSignature.trim() : null;

  if (txSignature) {
    if (txSignature.length < 64 || txSignature.length > 128) {
      res.status(400).json({ error: "txSignature must be a valid Solana transaction signature (64–128 chars)" });
      return;
    }

    const [dupe] = await db
      .select({ id: jobsTable.id })
      .from(jobsTable)
      .where(eq(jobsTable.txSignature, txSignature));

    if (dupe) {
      res.status(409).json({ error: "This transaction signature has already been used for a previous job" });
      return;
    }

    const expectedUsdc = parseFloat(Math.max(0.0001, (outputTokens / 1000) * pricePerK).toFixed(6));
    const check = await verifyUsdcPayment(txSignature, expectedUsdc);
    if (!check.ok) {
      res.status(402).json({ error: check.error ?? "Payment verification failed" });
      return;
    }
  }

  const [job] = await db.insert(jobsTable).values({
    model:         parsed.data.model,
    prompt:        parsed.data.prompt,
    clientAddress: parsed.data.clientAddress ?? null,
    inputTokens,
    outputTokens,
    earningUsdc,
    txSignature:   txSignature ?? null,
  }).returning();

  res.status(201).json(SubmitJobResponse.parse(mapJob(job)));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(mapJob(job)));
});

export default router;
