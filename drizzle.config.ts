import type { Config } from "drizzle-kit";

/**
 * Drizzle ORM configuration
 */
export default {
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
