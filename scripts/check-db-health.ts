import "dotenv/config";
import { checkDatabaseHealth } from "@/server/db/health";
import { prisma } from "@/server/db/prisma";

async function main() {
  const health = await checkDatabaseHealth();

  console.log(JSON.stringify(health, null, 2));

  await prisma.$disconnect();

  if (!health.ok) {
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
