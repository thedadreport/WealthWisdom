import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  paySchedule: text("pay_schedule").notNull(), // 'weekly', 'bi-weekly', 'monthly', 'semi-monthly'
  payDay: integer("pay_day"), // Day of month (1-31) for monthly/semi-monthly, or day of week (0-6) for weekly/bi-weekly
  lastPayDate: timestamp("last_pay_date"), // Most recent pay date to calculate periods accurately
  afterTaxIncome: decimal("after_tax_income", { precision: 10, scale: 2 }).notNull(),
  isOnboarded: boolean("is_onboarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fixedCostsPercent: decimal("fixed_costs_percent", { precision: 5, scale: 2 }).notNull(),
  investmentsPercent: decimal("investments_percent", { precision: 5, scale: 2 }).notNull(),
  savingsPercent: decimal("savings_percent", { precision: 5, scale: 2 }).notNull(),
  guiltFreeSpendingPercent: decimal("guilt_free_spending_percent", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // 'fixed-costs', 'investments', 'savings', 'guilt-free-spending'
  date: timestamp("date").notNull(),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  category: text("category").notNull(), // 'emergency', 'vacation', 'house', 'other'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // 'investments', 'savings'
  frequency: text("frequency").notNull(), // 'weekly', 'bi-weekly', 'monthly'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(), // 'morgan-housel', 'ramit-sethi'
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

// Enums
export const PaySchedule = z.enum(['weekly', 'bi-weekly', 'monthly', 'semi-monthly']);
export const TransactionCategory = z.enum(['fixed-costs', 'investments', 'savings', 'guilt-free-spending']);
export const GoalCategory = z.enum(['emergency', 'vacation', 'house', 'other']);
export const AutomationFrequency = z.enum(['weekly', 'bi-weekly', 'monthly']);
export const InsightAuthor = z.enum(['morgan-housel', 'ramit-sethi']);
