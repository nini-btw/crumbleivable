CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('cookie', 'box');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_type" "product_type" NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_slug" varchar(255) NOT NULL,
	"product_image" varchar(500),
	"quantity" integer NOT NULL,
	"price_snapshot" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"address" text NOT NULL,
	"cooking_note" text,
	"gift_note" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"type" "product_type" NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"flavour" varchar(255),
	"allergens" jsonb DEFAULT '[]'::jsonb,
	"is_new" boolean DEFAULT false,
	"is_sold_out" boolean DEFAULT false,
	"included_cookies" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vote_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cookie_name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_drops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"scheduled_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"revealed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_drops" ADD CONSTRAINT "weekly_drops_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;