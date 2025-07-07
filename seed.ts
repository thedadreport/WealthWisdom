import { db } from "./server/db";
import {
  users,
  budgets,
  transactions,
  goals,
  automations,
  insights,
} from "./shared/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("Clearing existing data...");
    await db.delete(insights);
    await db.delete(automations);
    await db.delete(goals);
    await db.delete(transactions);
    await db.delete(budgets);
    await db.delete(users);

    // Create sample user
    console.log("Creating sample user...");
    const [user] = await db
      .insert(users)
      .values({
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        paySchedule: "bi-weekly",
        payDay: 5, // Every other Friday
        lastPayDate: new Date("2025-01-03"), // Recent Friday
        afterTaxIncome: "3200.00", // $3,200 bi-weekly after taxes
        isOnboarded: true,
      })
      .returning();

    // Create budget for the user
    console.log("Creating sample budget...");
    const [budget] = await db
      .insert(budgets)
      .values({
        userId: user.id,
        fixedCostsPercent: "55.00", // 55%
        investmentsPercent: "15.00", // 15%
        savingsPercent: "10.00", // 10%
        guiltFreeSpendingPercent: "20.00", // 20%
      })
      .returning();

    // Create sample goals
    console.log("Creating sample goals...");
    const sampleGoals = [
      {
        userId: user.id,
        name: "Emergency Fund",
        targetAmount: "10000.00",
        currentAmount: "2500.00",
        category: "emergency",
        isActive: true,
      },
      {
        userId: user.id,
        name: "Hawaii Vacation",
        targetAmount: "5000.00",
        currentAmount: "1200.00",
        category: "vacation",
        isActive: true,
      },
      {
        userId: user.id,
        name: "House Down Payment",
        targetAmount: "50000.00",
        currentAmount: "15000.00",
        category: "house",
        isActive: true,
      },
    ];

    await db.insert(goals).values(sampleGoals);

    // Create sample automations
    console.log("Creating sample automations...");
    const sampleAutomations = [
      {
        userId: user.id,
        name: "401k Contribution",
        amount: "480.00", // 15% of $3200
        category: "investments",
        frequency: "bi-weekly",
        isActive: true,
      },
      {
        userId: user.id,
        name: "Emergency Fund",
        amount: "200.00",
        category: "savings",
        frequency: "bi-weekly",
        isActive: true,
      },
      {
        userId: user.id,
        name: "Vacation Savings",
        amount: "120.00",
        category: "savings",
        frequency: "bi-weekly",
        isActive: true,
      },
    ];

    await db.insert(automations).values(sampleAutomations);

    // Create sample transactions (last 30 days)
    console.log("Creating sample transactions...");
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Helper function to get random date in last 30 days
    const getRandomDate = () => {
      const time =
        thirtyDaysAgo.getTime() +
        Math.random() * (today.getTime() - thirtyDaysAgo.getTime());
      return new Date(time);
    };

    // Helper function to calculate pay period for a date
    const getPayPeriod = (date: Date) => {
      // For bi-weekly pay starting Jan 3, 2025
      const baseDate = new Date("2025-01-03");
      const daysDiff = Math.floor(
        (date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000),
      );
      const payPeriodNumber = Math.floor(daysDiff / 14);

      const payPeriodStart = new Date(
        baseDate.getTime() + payPeriodNumber * 14 * 24 * 60 * 60 * 1000,
      );
      const payPeriodEnd = new Date(
        payPeriodStart.getTime() + 13 * 24 * 60 * 60 * 1000,
      );

      return { payPeriodStart, payPeriodEnd };
    };

    const sampleTransactions = [
      // Fixed Costs
      {
        description: "Rent Payment",
        amount: "-1200.00",
        category: "fixed-costs",
      },
      {
        description: "Electric Bill",
        amount: "-89.50",
        category: "fixed-costs",
      },
      {
        description: "Internet Bill",
        amount: "-79.99",
        category: "fixed-costs",
      },
      {
        description: "Car Insurance",
        amount: "-145.00",
        category: "fixed-costs",
      },
      { description: "Phone Bill", amount: "-85.00", category: "fixed-costs" },
      {
        description: "Grocery Shopping",
        amount: "-125.50",
        category: "fixed-costs",
      },
      { description: "Gas Station", amount: "-45.00", category: "fixed-costs" },

      // Investments
      {
        description: "401k Contribution",
        amount: "-480.00",
        category: "investments",
      },
      { description: "Roth IRA", amount: "-250.00", category: "investments" },

      // Savings
      {
        description: "Emergency Fund Transfer",
        amount: "-200.00",
        category: "savings",
      },
      {
        description: "Vacation Savings",
        amount: "-120.00",
        category: "savings",
      },

      // Guilt-free spending
      {
        description: "Restaurant Dinner",
        amount: "-67.50",
        category: "guilt-free-spending",
      },
      {
        description: "Coffee Shop",
        amount: "-12.50",
        category: "guilt-free-spending",
      },
      {
        description: "Movie Theater",
        amount: "-28.00",
        category: "guilt-free-spending",
      },
      {
        description: "Amazon Purchase",
        amount: "-89.99",
        category: "guilt-free-spending",
      },
      {
        description: "Gym Membership",
        amount: "-39.99",
        category: "guilt-free-spending",
      },
      {
        description: "Streaming Services",
        amount: "-45.97",
        category: "guilt-free-spending",
      },
      {
        description: "Book Store",
        amount: "-24.99",
        category: "guilt-free-spending",
      },
    ];

    // Create multiple transactions with random dates
    const transactionsToInsert = [];

    for (let i = 0; i < 3; i++) {
      // Create 3 sets of transactions
      for (const transaction of sampleTransactions) {
        const randomDate = getRandomDate();
        const { payPeriodStart, payPeriodEnd } = getPayPeriod(randomDate);

        transactionsToInsert.push({
          userId: user.id,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          date: randomDate,
          payPeriodStart,
          payPeriodEnd,
        });
      }
    }

    await db.insert(transactions).values(transactionsToInsert);

    // Create insights
    console.log("Creating sample insights...");
    const sampleInsights = [
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
        title: "Pay Yourself First",
        content:
          "Before you pay anyone else, pay yourself. Automate your investments so the money is gone before you can spend it.",
        author: "ramit-sethi",
        category: "investing",
        isActive: true,
      },
      {
        title: "The Compound Effect",
        content:
          "Time in the market beats timing the market. Your consistent automated investments will compound over decades.",
        author: "morgan-housel",
        category: "investing",
        isActive: true,
      },
    ];

    await db.insert(insights).values(sampleInsights);

    console.log("✅ Database seeding completed successfully!");
    console.log(
      `Created user: ${user.firstName} ${user.lastName} (ID: ${user.id})`,
    );
    console.log(`Created budget with ${sampleGoals.length} goals`);
    console.log(`Created ${transactionsToInsert.length} transactions`);
    console.log(`Created ${sampleAutomations.length} automations`);
    console.log(`Created ${sampleInsights.length} insights`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
