import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function checkDatabase() {
  console.log("🔍 Checking database connection and data...");

  try {
    // Test basic connection
    console.log("Testing database connection...");

    // Check if users table exists and has data
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users in database`);

    if (allUsers.length > 0) {
      console.log("First user:", allUsers[0]);
    } else {
      console.log("❌ No users found in database!");
    }

    // Try to get user ID 1 specifically (fixed syntax)
    const userOne = await db.select().from(users).where(eq(users.id, 1));
    console.log("User ID 1:", userOne.length > 0 ? userOne[0] : "Not found");

    console.log("✅ Database connection is working!");
    console.log("✅ Data exists in database!");
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

// Run the check
checkDatabase()
  .then(() => {
    console.log("🏁 Database check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Check failed:", error);
    process.exit(1);
  });
