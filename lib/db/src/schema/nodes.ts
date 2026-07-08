import { pgTable, serial, text, integer, numeric, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nodeStatusEnum = pgEnum("node_status", ["online", "offline", "busy", "suspended"]);

export const nodesTable = pgTable("nodes", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  gpuModel: text("gpu_model").notNull(),
  vram: integer("vram").notNull(),
  status: nodeStatusEnum("status").notNull().default("offline"),
  region: text("region").notNull(),
  trustScore: real("trust_score").notNull().default(0),
  tokensPerSec: real("tokens_per_sec").notNull().default(0),
  totalEarningsUsdc: numeric("total_earnings_usdc", { precision: 18, scale: 6 }).notNull().default("0"),
  pendingPayoutUsdc: numeric("pending_payout_usdc", { precision: 18, scale: 6 }).notNull().default("0"),
  jobsCompleted: integer("jobs_completed").notNull().default(0),
  jobsFailed: integer("jobs_failed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastHeartbeat: timestamp("last_heartbeat"),
});

export const insertNodeSchema = createInsertSchema(nodesTable).omit({
  id: true,
  trustScore: true,
  tokensPerSec: true,
  totalEarningsUsdc: true,
  pendingPayoutUsdc: true,
  jobsCompleted: true,
  jobsFailed: true,
  createdAt: true,
  lastHeartbeat: true,
  status: true,
});

export type InsertNode = z.infer<typeof insertNodeSchema>;
export type Node = typeof nodesTable.$inferSelect;
