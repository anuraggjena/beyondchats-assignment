CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"enhanced_content" text,
	"references" text,
	"is_updated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
