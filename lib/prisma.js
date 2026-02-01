import { PrismaClient } from "@prisma/client";

let prisma;

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Log only once on first initialization
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Prisma Client initialized");
  }
}

prisma = globalForPrisma.prisma;

export default prisma;
