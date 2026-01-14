// test-db.js
const { PrismaClient } = require('@prisma/client');

// ⚠️ IMPORTANT: PASTE YOUR FULL DATABASE URL INSIDE THE QUOTES BELOW
// Use the one with Port 6543 and ?pgbouncer=true
const connectionString = "postgres://postgres.kvdonwbznqsoistnvubg:chickentandoori65@db.kvdonwbznqsoistnvubg.supabase.co:6543/postgres?pgbouncer=true";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

async function main() {
  console.log("🔍 Testing direct connection...");
  try {
    await prisma.$connect();
    console.log("✅ SUCCESS! The database is reachable.");
    console.log("If this works, your .env file is the problem.");
  } catch (error) {
    console.error("\n❌ FAILED TO CONNECT");
    console.error("Error Message:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();