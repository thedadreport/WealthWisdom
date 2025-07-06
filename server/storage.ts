import { 
  users, budgets, transactions, goals, automations, insights,
  type User, type InsertUser, type Budget, type InsertBudget,
  type Transaction, type InsertTransaction, type Goal, type InsertGoal,
  type Automation, type InsertAutomation, type Insight, type InsertInsight
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Budgets
  getBudgetByUserId(userId: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  
  // Transactions
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByPayPeriod(userId: number, payPeriodStart: Date, payPeriodEnd: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
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
  updateAutomation(id: number, automation: Partial<InsertAutomation>): Promise<Automation | undefined>;
  deleteAutomation(id: number): Promise<boolean>;
  
  // Insights
  getActiveInsights(): Promise<Insight[]>;
  getInsightsByAuthor(author: string): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private budgets: Map<number, Budget> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private goals: Map<number, Goal> = new Map();
  private automations: Map<number, Automation> = new Map();
  private insights: Map<number, Insight> = new Map();
  
  private userIdCounter = 1;
  private budgetIdCounter = 1;
  private transactionIdCounter = 1;
  private goalIdCounter = 1;
  private automationIdCounter = 1;
  private insightIdCounter = 1;

  constructor() {
    // Initialize with some insights
    this.seedInsights();
  }

  private seedInsights() {
    const defaultInsights: InsertInsight[] = [
      {
        title: "The Psychology of Money",
        content: "The hardest financial skill is getting the goalpost to stop moving. Your automated investments are building wealth without requiring daily decisions.",
        author: "morgan-housel",
        category: "psychology",
        isActive: true,
      },
      {
        title: "Automation First",
        content: "Don't rely on willpower to save money. Set up automatic transfers and let your system work for you.",
        author: "ramit-sethi",
        category: "automation",
        isActive: true,
      },
      {
        title: "Rich Life Framework",
        content: "Money is a tool to live your Rich Life. Spend extravagantly on the things you love, and cut costs mercilessly on the things you don't.",
        author: "ramit-sethi",
        category: "mindset",
        isActive: true,
      },
    ];

    defaultInsights.forEach(insight => this.createInsight(insight));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Budgets
  async getBudgetByUserId(userId: number): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(budget => budget.userId === userId);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const budget: Budget = {
      ...insertBudget,
      id,
      createdAt: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updateBudget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updatedBudget = { ...budget, ...updateBudget };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  // Transactions
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransactionsByPayPeriod(userId: number, payPeriodStart: Date, payPeriodEnd: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.userId === userId &&
        new Date(transaction.payPeriodStart).getTime() === payPeriodStart.getTime() &&
        new Date(transaction.payPeriodEnd).getTime() === payPeriodEnd.getTime()
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updateTransaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...updateTransaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Goals
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && goal.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const goal: Goal = {
      ...insertGoal,
      id,
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updateGoal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updateGoal };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Automations
  async getAutomationsByUserId(userId: number): Promise<Automation[]> {
    return Array.from(this.automations.values())
      .filter(automation => automation.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const id = this.automationIdCounter++;
    const automation: Automation = {
      ...insertAutomation,
      id,
      createdAt: new Date(),
    };
    this.automations.set(id, automation);
    return automation;
  }

  async updateAutomation(id: number, updateAutomation: Partial<InsertAutomation>): Promise<Automation | undefined> {
    const automation = this.automations.get(id);
    if (!automation) return undefined;
    
    const updatedAutomation = { ...automation, ...updateAutomation };
    this.automations.set(id, updatedAutomation);
    return updatedAutomation;
  }

  async deleteAutomation(id: number): Promise<boolean> {
    return this.automations.delete(id);
  }

  // Insights
  async getActiveInsights(): Promise<Insight[]> {
    return Array.from(this.insights.values())
      .filter(insight => insight.isActive);
  }

  async getInsightsByAuthor(author: string): Promise<Insight[]> {
    return Array.from(this.insights.values())
      .filter(insight => insight.author === author && insight.isActive);
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = this.insightIdCounter++;
    const insight: Insight = {
      ...insertInsight,
      id,
    };
    this.insights.set(id, insight);
    return insight;
  }
}

export const storage = new MemStorage();
