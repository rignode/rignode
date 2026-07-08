import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const earningsTable = pgTable("earnings", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id").notNull(),
  amountUsdc: numeric("amount_usdc", { precision: 18, scale: 6 }).notNull(),
  txSignature: text("tx_signature"),
  batchedJobs: integer("batched_jobs").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEarningSchema = createInsertSchema(earningsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earningsTable.$inferSelect;
