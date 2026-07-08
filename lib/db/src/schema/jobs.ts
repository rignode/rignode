import { pgTable, serial, text, integer, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobStatusEnum = pgEnum("job_status", ["pending", "assigned", "running", "completed", "failed", "disputed"]);

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id"),
  status: jobStatusEnum("status").notNull().default("pending"),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  earningUsdc: numeric("earning_usdc", { precision: 18, scale: 6 }).notNull().default("0"),
  txSignature: text("tx_signature"),
  durationMs: integer("duration_ms"),
  verified: boolean("verified").notNull().default(false),
  clientAddress: text("client_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  id: true,
  nodeId: true,
  status: true,
  inputTokens: true,
  outputTokens: true,
  earningUsdc: true,
  txSignature: true,
  durationMs: true,
  verified: true,
  createdAt: true,
  completedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
