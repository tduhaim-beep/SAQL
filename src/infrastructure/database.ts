import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const runtime = globalThis as typeof globalThis & { saqlDatabase?: PrismaClient };
export function database(): PrismaClient {
  if (runtime.saqlDatabase) return runtime.saqlDatabase;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  runtime.saqlDatabase = client;
  return client;
}
