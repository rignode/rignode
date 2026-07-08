import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, nodesTable, jobsTable, earningsTable } from "@workspace/db";
import type { Node, Job, Earning } from "@workspace/db";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const VALID_GPU_MODELS = new Set([
  // NVIDIA RTX 30-series
  "RTX 3060","RTX 3060 Ti","RTX 3070","RTX 3070 Ti","RTX 3080","RTX 3080 Ti","RTX 3090","RTX 3090 Ti",
  // NVIDIA RTX 40-series
  "RTX 4060","RTX 4060 Ti","RTX 4070","RTX 4070 Ti","RTX 4070 Ti Super","RTX 4080","RTX 4080 Super","RTX 4090",
  // NVIDIA RTX 50-series
  "RTX 5070","RTX 5070 Ti","RTX 5080","RTX 5090",
  // NVIDIA Data Center
  "RTX A4000","RTX A4500","RTX A6000","A10","A100 40G","A100 80G","H100 SXM","H100 PCIe",
  // AMD Radeon RX 6000
  "RX 6600 XT","RX 6700 XT","RX 6800","RX 6800 XT","RX 6900 XT","RX 6950 XT",
  // AMD Radeon RX 7000
  "RX 7600","RX 7700 XT","RX 7800 XT","RX 7900 GRE","RX 7900 XT","RX 7900 XTX",
  // AMD Radeon RX 9000
  "RX 9070","RX 9070 XT",
  // Intel Arc
  "Arc A770 16G","Arc B580","Arc B770",
]);
const VALID_REGIONS = new Set(["us-east","us-west","eu-west","ap-southeast","sa-east"]);

function mapNode(n: Node) {
  const now = Date.now();
  const heartbeatMs = n.lastHeartbeat ? n.lastHeartbeat.getTime() : null;
  const isStale = heartbeatMs !== null && now - heartbeatMs > 5 * 60 * 1000;
  const status = isStale ? "offline" : n.status;

  return {
    ...n,
    status,
    totalEarningsUsdc: parseFloat(String(n.totalEarningsUsdc)),
    pendingPayoutUsdc: parseFloat(String(n.pendingPayoutUsdc)),
    createdAt: n.createdAt.toISOString(),
    lastHeartbeat: n.lastHeartbeat ? n.lastHeartbeat.toISOString() : null,
  };
}

function mapJob(j: Job) {
  return {
    ...j,
    earningUsdc: parseFloat(String(j.earningUsdc)),
    createdAt: j.createdAt.toISOString(),
    completedAt: j.completedAt ? j.completedAt.toISOString() : null,
  };
}

function mapEarning(e: Earning) {
  return {
    ...e,
    amountUsdc: parseFloat(String(e.amountUsdc)),
    createdAt: e.createdAt.toISOString(),
  };
}

import {
  RegisterNodeBody,
  RegisterNodeResponse,
  GetNodeParams,
  GetNodeResponse,
  UpdateNodeParams,
  UpdateNodeBody,
  UpdateNodeResponse,
  ListNodesResponse,
  ListNodeJobsParams,
  ListNodeJobsResponse,
  ListNodeEarningsParams,
  ListNodeEarningsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/nodes", async (_req, res): Promise<void> => {
  const nodes = await db.select().from(nodesTable).orderBy(nodesTable.createdAt);
  res.json(ListNodesResponse.parse(nodes.map(mapNode)));
});

router.post("/nodes", async (req, res): Promise<void> => {
  const parsed = RegisterNodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { walletAddress, gpuModel, vram, region } = parsed.data;

  if (!BASE58_RE.test(walletAddress)) {
    res.status(400).json({ error: "Invalid Solana wallet address. Must be 32–44 base58 characters." });
    return;
  }

  if (!VALID_GPU_MODELS.has(gpuModel)) {
    res.status(400).json({ error: `Unknown GPU model: ${gpuModel}` });
    return;
  }

  if (!VALID_REGIONS.has(region)) {
    res.status(400).json({ error: `Unknown region: ${region}` });
    return;
  }

  if (vram < 4 || vram > 160) {
    res.status(400).json({ error: "VRAM must be between 4 and 160 GB" });
    return;
  }

  const [node] = await db.insert(nodesTable).values({
    walletAddress,
    gpuModel,
    vram,
    region,
  }).returning();

  res.status(201).json(RegisterNodeResponse.parse(mapNode(node)));
});

router.get("/nodes/:id", async (req, res): Promise<void> => {
  const params = GetNodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [node] = await db.select().from(nodesTable).where(eq(nodesTable.id, params.data.id));
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  res.json(GetNodeResponse.parse(mapNode(node)));
});

router.patch("/nodes/:id", async (req, res): Promise<void> => {
  const params = UpdateNodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateNodeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.status !== undefined) updateData.status = body.data.status;
  if (body.data.tokensPerSec !== undefined) updateData.tokensPerSec = body.data.tokensPerSec;
  if (body.data.lastHeartbeat !== undefined) updateData.lastHeartbeat = new Date(body.data.lastHeartbeat);

  const [node] = await db.update(nodesTable).set(updateData).where(eq(nodesTable.id, params.data.id)).returning();
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  res.json(UpdateNodeResponse.parse(mapNode(node)));
});

router.post("/nodes/:id/heartbeat", async (req, res): Promise<void> => {
  const params = GetNodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [node] = await db
    .update(nodesTable)
    .set({ lastHeartbeat: new Date(), status: "online" })
    .where(eq(nodesTable.id, params.data.id))
    .returning();

  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  res.json({ ok: true, nodeId: node.id, lastHeartbeat: node.lastHeartbeat!.toISOString() });
});

router.get("/nodes/:id/jobs", async (req, res): Promise<void> => {
  const params = ListNodeJobsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.nodeId, params.data.id)).orderBy(jobsTable.createdAt);
  res.json(ListNodeJobsResponse.parse(jobs.map(mapJob)));
});

router.get("/nodes/:id/earnings", async (req, res): Promise<void> => {
  const params = ListNodeEarningsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const earnings = await db.select().from(earningsTable).where(eq(earningsTable.nodeId, params.data.id)).orderBy(earningsTable.createdAt);
  res.json(ListNodeEarningsResponse.parse(earnings.map(mapEarning)));
});

export default router;
