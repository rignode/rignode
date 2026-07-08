import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { getSolanaConfig } from "../lib/solana";

const router: IRouter = Router();

const PRICE_PER_OUTPUT_K: Record<string, number> = {
  "llama3-8b-q4":     0.0004,
  "llama3-70b-q4":    0.0016,
  "mistral-7b-q4":    0.0003,
  "qwen2-7b-q4":      0.0003,
  "whisper-large-v3": 0.0006,
};

export interface Quote {
  model: string;
  amountUsdc: number;
  expiresAt: Date;
}

export const quotes = new Map<string, Quote>();

router.post("/pay/quote", (req, res): void => {
  const body = req.body as Record<string, unknown>;
  const model = typeof body.model === "string" ? body.model.trim() : "";
  const rawLen = typeof body.promptLength === "number" ? body.promptLength : 100;
  const promptLength = Math.max(1, Math.min(50000, Math.floor(rawLen)));

  if (!model) {
    res.status(400).json({ error: "model is required" });
    return;
  }

  const pricePerOutputK = PRICE_PER_OUTPUT_K[model];
  if (!pricePerOutputK) {
    res.status(400).json({ error: `Unknown model: ${model}` });
    return;
  }

  const inputTokens  = Math.max(10, Math.floor(promptLength / 4));
  const outputTokens = Math.floor(inputTokens * 1.5);
  const rawAmount    = (outputTokens / 1000) * pricePerOutputK;
  const amountUsdc   = parseFloat(Math.max(0.0001, rawAmount).toFixed(6));

  const quoteId   = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  quotes.set(quoteId, { model, amountUsdc, expiresAt });

  for (const [id, q] of quotes) {
    if (q.expiresAt < new Date()) quotes.delete(id);
  }

  const { treasuryWallet, usdcMint, network } = getSolanaConfig();

  if (!treasuryWallet) {
    res.status(503).json({ error: "Payment not available — TREASURY_WALLET not configured on server" });
    return;
  }

  res.json({
    quoteId,
    model,
    amountUsdc,
    treasuryWallet,
    usdcMint,
    network,
    expiresAt: expiresAt.toISOString(),
  });
});

export default router;
