import {
  users,
  budgets,
  transactions,
  goals,
  automations,
  insights,
  type User,
  type InsertUser,
  type Budget,
  type InsertBudget,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type Automation,
  type InsertAutomation,
  type Insight,
  type InsertInsight,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Budgets
  getBudgetByUserId(userId: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(
    id: number,
    budget: Partial<InsertBudget>,
  ): Promise<Budget | undefined>;

  // Transactions
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByPayPeriod(
    userId: number,
    payPeriodStart: Date,
    payPeriodEnd: Date,
  ): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(
    id: number,
    transaction: Partial<InsertTransaction>,
  ): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Goals
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Automations
  getAutomationsByUserId(userId: number): Promise<Automation[]>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(
    id: number,
    automation: Partial<InsertAutomation>,
  ): Promise<Automation | undefined>;
  deleteAutomation(id: number): Promise<boolean>;

  // Insights
  getActiveInsights(): Promise<Insight[]>;
  getInsightsByAuthor(author: string): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with some insights on first run
    this.seedInsights();
  }

  private async seedInsights() {
    try {
      // Check if insights already exist
      const existingInsights = await db.select().from(insights).limit(1);
      if (existingInsights.length > 0) return;

      const defaultInsights: InsertInsight[] = [
        {
          title: "The Psychology of Money",
          content:
            "The hardest financial skill is getting the goalpost to stop moving. Your automated investments are building wealth without requiring daily decisions.",
          author: "morgan-housel",
          category: "psychology",
          isActive: true,
        },
        {
          title: "Automation First",
          content:
            "Don't rely on willpower to save money. Set up automatic transfers and let your system work for you.",
          author: "ramit-sethi",
          category: "automation",
          isActive: true,
        },
        {
          title: "Rich Life Framework",
          content:
            "Money is a tool to live your Rich Life. Spend extravagantly on the things you love, and cut costs mercilessly on the things you don't.",
          author: "ramit-sethi",
          category: "mindset",
          isActive: true,
        },
      ];

      await db.insert(insights).values(defaultInsights);
    } catch (error) {
      // Ignore errors for seeding - table might not exist yet
      console.log("Note: Could not seed insights (table may not exist yet)");
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log(`Looking for user with ID: ${id}`);
      const result = await db.select().from(users).where(eq(users.id, id));
      console.log(`Query result:`, result);
      const user = result[0];
      console.log(`Found user:`, user);
      return user || undefined;
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return result[0] || undefined;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: number,
    updateUser: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Budgets
  async getBudgetByUserId(userId: number): Promise<Budget | undefined> {
    try {
      const result = await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, userId));
      return result[0] || undefined;
    } catch (error) {
      console.error(`Error getting budget for user ${userId}:`, error);
      return undefined;
    }
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(insertBudget).returning();
    return budget;
  }

  async updateBudget(
    id: number,
    updateBudget: Partial<InsertBudget>,
  ): Promise<Budget | undefined> {
    const [budget] = await db
      .update(budgets)
      .set(updateBudget)
      .where(eq(budgets.id, id))
      .returning();
    return budget || undefined;
  }

  // Transactions
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    try {
      const results = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId));
      return results.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } catch (error) {
      console.error(`Error getting transactions for user ${userId}:`, error);
      return [];
    }
  }

  async getTransactionsByPayPeriod(
    userId: number,
    payPeriodStart: Date,
    payPeriodEnd: Date,
  ): Promise<Transaction[]> {
    try {
      const results = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId));
      return results
        .filter(
          (transaction) =>
            transaction.payPeriodStart.getTime() === payPeriodStart.getTime() &&
            transaction.payPeriodEnd.getTime() === payPeriodEnd.getTime(),
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    } catch (error) {
      console.error(
        `Error getting transactions by pay period for user ${userId}:`,
        error,
      );
      return [];
    }
  }

  async createTransaction(
    insertTransaction: InsertTransaction,
  ): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(
    id: number,
    updateTransaction: Partial<InsertTransaction>,
  ): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updateTransaction)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount > 0;
  }

  // Goals
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    try {
      const results = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, userId));
      return results
        .filter((goal) => goal.isActive)
        .sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
        );
    } catch (error) {
      console.error(`Error getting goals for user ${userId}:`, error);
      return [];
    }
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    try {
      const result = await db.select().from(goals).where(eq(goals.id, id));
      return result[0] || undefined;
    } catch (error) {
      console.error(`Error getting goal ${id}:`, error);
      return undefined;
    }
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({
        ...insertGoal,
        currentAmount: insertGoal.currentAmount || "0",
        isActive: insertGoal.isActive ?? true,
      })
      .returning();
    return goal;
  }

  async updateGoal(
    id: number,
    updateGoal: Partial<InsertGoal>,
  ): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set(updateGoal)
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount > 0;
  }

  // Automations
  async getAutomationsByUserId(userId: number): Promise<Automation[]> {
    try {
      const results = await db
        .select()
        .from(automations)
        .where(eq(automations.userId, userId));
      return results.sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
    } catch (error) {
      console.error(`Error getting automations for user ${userId}:`, error);
      return [];
    }
  }

  async createAutomation(
    insertAutomation: InsertAutomation,
  ): Promise<Automation> {
    const [automation] = await db
      .insert(automations)
      .values({
        ...insertAutomation,
        isActive: insertAutomation.isActive ?? true,
      })
      .returning();
    return automation;
  }

  async updateAutomation(
    id: number,
    updateAutomation: Partial<InsertAutomation>,
  ): Promise<Automation | undefined> {
    const [automation] = await db
      .update(automations)
      .set(updateAutomation)
      .where(eq(automations.id, id))
      .returning();
    return automation || undefined;
  }

  async deleteAutomation(id: number): Promise<boolean> {
    const result = await db.delete(automations).where(eq(automations.id, id));
    return result.rowCount > 0;
  }

  // Insights
  async getActiveInsights(): Promise<Insight[]> {
    try {
      const results = await db.select().from(insights);
      return results.filter((insight) => insight.isActive);
    } catch (error) {
      console.error("Error getting active insights:", error);
      return [];
    }
  }

  async getInsightsByAuthor(author: string): Promise<Insight[]> {
    try {
      const results = await db.select().from(insights);
      return results.filter(
        (insight) => insight.author === author && insight.isActive,
      );
    } catch (error) {
      console.error(`Error getting insights by author ${author}:`, error);
      return [];
    }
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const [insight] = await db
      .insert(insights)
      .values({
        ...insertInsight,
        isActive: insertInsight.isActive ?? true,
      })
      .returning();
    return insight;
  }
}

export const storage = new DatabaseStorage();
