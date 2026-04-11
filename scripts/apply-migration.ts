/**
 * Apply database migration manually
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/infrastructure/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Type assertion for connectionString
const dbUrl: string = connectionString;

async function applyMigration() {
  console.log("Connecting to database...");
  
  // Create connection
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log("Applying migration...");
    
    // Add deleted_at column to orders if not exists
    await client`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'deleted_at'
        ) THEN 
          ALTER TABLE orders ADD COLUMN deleted_at timestamp;
        END IF;
      END $$;
    `;
    console.log("✓ Added deleted_at column to orders");
    
    // Create vote_logs table if not exists
    await client`
      CREATE TABLE IF NOT EXISTS vote_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id uuid NOT NULL REFERENCES vote_candidates(id) ON DELETE CASCADE,
        voter_fingerprint varchar(255) NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✓ Created vote_logs table");
    
    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
