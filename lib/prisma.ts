// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log queries in development. Logging every query in production
    // adds latency and floods the Vercel logs.
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });

// Cache the client on the global object in ALL environments. On Vercel,
// warm serverless invocations reuse the same client/connection pool instead
// of opening a fresh one on every request.
globalForPrisma.prisma = db;
