CREATE TABLE IF NOT EXISTS "task_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "git_repo_url" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "env_file" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_notes" ADD CONSTRAINT "task_notes_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
