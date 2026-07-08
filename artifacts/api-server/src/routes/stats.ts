import { Router, type IRouter } from "express";
import { db, nodesTable, jobsTable } from "@workspace/db";
import { eq, count, sum, avg, desc } from "drizzle-orm";
import {
  GetNetworkStatsResponse,
  GetTokenStatsResponse,
  GetProfitabilityQueryParams,
  GetProfitabilityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GPU_SPECS: Record<string, { tps: number; powerWatts: number }> = {
  // NVIDIA RTX 30-series
  "RTX 3060":          { tps: 18,  powerWatts: 170 },
  "RTX 3060 Ti":       { tps: 22,  powerWatts: 200 },
  "RTX 3070":          { tps: 28,  powerWatts: 220 },
  "RTX 3070 Ti":       { tps: 32,  powerWatts: 290 },
  "RTX 3080":          { tps: 42,  powerWatts: 320 },
  "RTX 3080 Ti":       { tps: 48,  powerWatts: 350 },
  "RTX 3090":          { tps: 58,  powerWatts: 350 },
  "RTX 3090 Ti":       { tps: 62,  powerWatts: 450 },
  // NVIDIA RTX 40-series
  "RTX 4060":          { tps: 35,  powerWatts: 115 },
  "RTX 4060 Ti":       { tps: 45,  powerWatts: 160 },
  "RTX 4070":          { tps: 55,  powerWatts: 200 },
  "RTX 4070 Ti":       { tps: 68,  powerWatts: 285 },
  "RTX 4070 Ti Super": { tps: 75,  powerWatts: 285 },
  "RTX 4080":          { tps: 88,  powerWatts: 320 },
  "RTX 4080 Super":    { tps: 92,  powerWatts: 320 },
  "RTX 4090":          { tps: 120, powerWatts: 450 },
  // NVIDIA RTX 50-series
  "RTX 5070":          { tps: 110, powerWatts: 250 },
  "RTX 5070 Ti":       { tps: 130, powerWatts: 300 },
  "RTX 5080":          { tps: 145, powerWatts: 360 },
  "RTX 5090":          { tps: 200, powerWatts: 575 },
  // NVIDIA Data Center
  "RTX A4000":         { tps: 72,  powerWatts: 140 },
  "RTX A4500":         { tps: 85,  powerWatts: 200 },
  "RTX A6000":         { tps: 105, powerWatts: 300 },
  "A10":               { tps: 95,  powerWatts: 150 },
  "A100 40G":          { tps: 180, powerWatts: 400 },
  "A100 80G":          { tps: 200, powerWatts: 400 },
  "H100 SXM":          { tps: 350, powerWatts: 700 },
  "H100 PCIe":         { tps: 280, powerWatts: 350 },
  // AMD Radeon RX 6000
  "RX 6600 XT":        { tps: 12,  powerWatts: 160 },
  "RX 6700 XT":        { tps: 18,  powerWatts: 230 },
  "RX 6800":           { tps: 24,  powerWatts: 250 },
  "RX 6800 XT":        { tps: 28,  powerWatts: 300 },
  "RX 6900 XT":        { tps: 32,  powerWatts: 300 },
  "RX 6950 XT":        { tps: 35,  powerWatts: 335 },
  // AMD Radeon RX 7000
  "RX 7600":           { tps: 16,  powerWatts: 165 },
  "RX 7700 XT":        { tps: 22,  powerWatts: 245 },
  "RX 7800 XT":        { tps: 32,  powerWatts: 263 },
  "RX 7900 GRE":       { tps: 40,  powerWatts: 260 },
  "RX 7900 XT":        { tps: 48,  powerWatts: 315 },
  "RX 7900 XTX":       { tps: 55,  powerWatts: 355 },
  // AMD Radeon RX 9000
  "RX 9070":           { tps: 42,  powerWatts: 220 },
  "RX 9070 XT":        { tps: 52,  powerWatts: 304 },
  // Intel Arc
  "Arc A770 16G":      { tps: 14,  powerWatts: 225 },
  "Arc B580":          { tps: 16,  powerWatts: 150 },
  "Arc B770":          { tps: 22,  powerWatts: 200 },
};

router.get("/stats/tokens", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      model: jobsTable.model,
      inputTokens: sum(jobsTable.inputTokens),
      outputTokens: sum(jobsTable.outputTokens),
      jobCount: count(),
      usdcPaid: sum(jobsTable.earningUsdc),
    })
    .from(jobsTable)
    .groupBy(jobsTable.model)
    .orderBy(desc(sum(jobsTable.outputTokens)));

  const byModel = rows.map(r => ({
    model: r.model,
    inputTokens: Number(r.inputTokens ?? 0),
    outputTokens: Number(r.outputTokens ?? 0),
    jobCount: Number(r.jobCount ?? 0),
    usdcPaid: parseFloat(String(r.usdcPaid ?? "0")),
  }));

  const totalInputTokens = byModel.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutputTokens = byModel.reduce((s, r) => s + r.outputTokens, 0);
  const totalJobs = byModel.reduce((s, r) => s + r.jobCount, 0);
  const totalUsdcPaid = byModel.reduce((s, r) => s + r.usdcPaid, 0);

  res.json(GetTokenStatsResponse.parse({
    totalInputTokens,
    totalOutputTokens,
    totalJobs,
    totalUsdcPaid: parseFloat(totalUsdcPaid.toFixed(6)),
    byModel,
    updatedAt: new Date().toISOString(),
  }));
});

router.get("/stats/network", async (_req, res): Promise<void> => {
  const allNodes = await db.select().from(nodesTable);
  const totalNodes = allNodes.length;
  const activeNodes = allNodes.filter(n => n.status === "online" || n.status === "busy").length;

  const [jobStats] = await db.select({
    total: count(),
    totalEarnings: sum(jobsTable.earningUsdc),
  }).from(jobsTable).where(eq(jobsTable.status, "completed"));

  const [avgTrust] = await db.select({ avg: avg(nodesTable.trustScore) }).from(nodesTable);

  // Jobs in the last hour
  const oneHourAgo = new Date(Date.now() - 3600000);
  const recentJobs = await db.select().from(jobsTable);
  const recentCount = recentJobs.filter(j => j.createdAt > oneHourAgo).length;

  const modelCounts: Record<string, number> = {};
  recentJobs.forEach(j => { modelCounts[j.model] = (modelCounts[j.model] ?? 0) + 1; });
  const topModels = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([m]) => m);

  const stats = {
    totalNodes,
    activeNodes,
    totalJobsCompleted: Number(jobStats?.total ?? 0),
    totalUsdcPaid: parseFloat(String(jobStats?.totalEarnings ?? "0")),
    avgTrustScore: parseFloat(String(avgTrust?.avg ?? "0")) || 0,
    jobsPerHour: recentCount,
    topModels: topModels.length > 0 ? topModels : ["llama3-8b-q4", "mistral-7b-q4", "whisper-large-v3"],
  };

  res.json(GetNetworkStatsResponse.parse(stats));
});

router.get("/stats/profitability", async (req, res): Promise<void> => {
  const queryParsed = GetProfitabilityQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const {
    gpuModel = "RTX 3070",
    powerWatts,
    electricityRate = 0.12,
    utilizationPct = 15,
  } = queryParsed.data;

  const spec = GPU_SPECS[gpuModel] ?? { tps: 30, powerWatts: 220 };
  const watts = powerWatts ?? spec.powerWatts;
  const utilFraction = (utilizationPct ?? 15) / 100;

  const PRICE_PER_TOKEN_OUTPUT = 0.0001 / 1000; // $0.0001 per 1k output tokens
  const NODE_SHARE = 0.80;
  const tokensPerDay = spec.tps * 3600 * 24 * utilFraction;
  const dailyEarningsUsdc = tokensPerDay * PRICE_PER_TOKEN_OUTPUT * NODE_SHARE;

  const kwh = (watts / 1000) * 24;
  const dailyElectricityCostUsd = kwh * (electricityRate ?? 0.12);
  const dailyNetUsdc = dailyEarningsUsdc - dailyElectricityCostUsd;

  const breakEvenUtilization = dailyElectricityCostUsd > 0
    ? (dailyElectricityCostUsd / (tokensPerDay / utilFraction * PRICE_PER_TOKEN_OUTPUT * NODE_SHARE)) * 100
    : 0;

  const result = {
    gpuModel: gpuModel ?? "RTX 3070",
    dailyEarningsUsdc: parseFloat(dailyEarningsUsdc.toFixed(4)),
    monthlyEarningsUsdc: parseFloat((dailyEarningsUsdc * 30).toFixed(4)),
    dailyElectricityCostUsd: parseFloat(dailyElectricityCostUsd.toFixed(4)),
    dailyNetUsdc: parseFloat(dailyNetUsdc.toFixed(4)),
    monthlyNetUsdc: parseFloat((dailyNetUsdc * 30).toFixed(4)),
    breakEvenUtilizationPct: parseFloat(breakEvenUtilization.toFixed(2)),
    assumptions: `Based on ${spec.tps} tokens/sec at ${utilizationPct}% utilization, $${electricityRate}/kWh electricity rate, ${watts}W power draw. Node operator receives 80% of job earnings.`,
  };

  res.json(GetProfitabilityResponse.parse(result));
});

export default router;
