CREATE TABLE "vote_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"voter_fingerprint" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "vote_logs" ADD CONSTRAINT "vote_logs_candidate_id_vote_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."vote_candidates"("id") ON DELETE cascade ON UPDATE no action;