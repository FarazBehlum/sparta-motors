import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trucks_inspection_points_area" AS ENUM('engine', 'transmission', 'brakes', 'tires', 'suspension', 'electrical', 'frame', 'emissions', 'interior', 'body');
  CREATE TYPE "public"."enum_trucks_inspection_points_rating" AS ENUM('good', 'fair', 'attention');
  CREATE TYPE "public"."enum_trucks_make" AS ENUM('isuzu', 'hino', 'freightliner', 'nissan', 'volvo', 'peterbilt', 'kenworth', 'mack', 'international', 'other');
  CREATE TYPE "public"."enum_trucks_body_type" AS ENUM('box-truck', 'reefer', 'day-cab', 'flat-bed', 'dump-truck', 'tow-truck');
  CREATE TYPE "public"."enum_trucks_condition" AS ENUM('excellent', 'good', 'fair');
  CREATE TYPE "public"."enum_trucks_title_status" AS ENUM('clean', 'rebuilt', 'salvage', 'lien');
  CREATE TYPE "public"."enum_trucks_fuel_type" AS ENUM('diesel', 'gasoline');
  CREATE TYPE "public"."enum_trucks_payload_class" AS ENUM('class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8');
  CREATE TYPE "public"."enum_trucks_drivetrain" AS ENUM('RWD', '4WD', 'AWD');
  CREATE TYPE "public"."enum_trucks_status" AS ENUM('draft', 'pending-review', 'published', 'archived');
  CREATE TYPE "public"."enum_trucks_availability" AS ENUM('available', 'pending', 'sold');
  CREATE TYPE "public"."enum_leads_source" AS ENUM('truck-inquiry', 'financing-prequal', 'general-contact');
  CREATE TYPE "public"."enum_leads_heard_about_us" AS ENUM('google', 'facebook', 'referral', 'drove-by-lot', 'other');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'closed-sold', 'closed-lost');
  CREATE TYPE "public"."enum_fleet_inquiries_fleet_size" AS ENUM('1-3', '4-10', '10-plus');
  CREATE TYPE "public"."enum_fleet_inquiries_timeline" AS ENUM('asap', '1-3-months', '3-6-months', 'ongoing');
  CREATE TYPE "public"."enum_fleet_inquiries_heard_about_us" AS ENUM('google', 'facebook', 'referral', 'drove-by-lot', 'other');
  CREATE TYPE "public"."enum_fleet_inquiries_status" AS ENUM('new', 'sourcing', 'presented', 'closed-sold', 'closed-lost');
  CREATE TYPE "public"."enum_pages_blocks_form_block_form_type" AS ENUM('financing-prequal', 'general-contact');
  CREATE TYPE "public"."enum_pages_blocks_map_block_size" AS ENUM('small', 'full');
  CREATE TYPE "public"."enum_pages_slug" AS ENUM('home', 'about', 'financing', 'parts', 'contact');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'employee');
  CREATE TABLE "trucks_inspection_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" "enum_trucks_inspection_points_area" NOT NULL,
  	"rating" "enum_trucks_inspection_points_rating" NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "trucks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"year" numeric NOT NULL,
  	"make" "enum_trucks_make" NOT NULL,
  	"model" varchar NOT NULL,
  	"trim" varchar,
  	"body_type" "enum_trucks_body_type" NOT NULL,
  	"listing_title" varchar,
  	"vin" varchar,
  	"price" numeric NOT NULL,
  	"condition" "enum_trucks_condition",
  	"title_status" "enum_trucks_title_status",
  	"owners" numeric,
  	"mileage" numeric NOT NULL,
  	"fuel_type" "enum_trucks_fuel_type" NOT NULL,
  	"gvwr" numeric,
  	"payload_class" "enum_trucks_payload_class",
  	"engine" varchar,
  	"transmission" varchar,
  	"drivetrain" "enum_trucks_drivetrain",
  	"inspection_inspected_date" timestamp(3) with time zone,
  	"inspection_inspected_by" varchar,
  	"inspection_summary" varchar,
  	"video_url" varchar,
  	"video_file_id" integer,
  	"spec_sheet_id" integer,
  	"description" varchar NOT NULL,
  	"status" "enum_trucks_status" DEFAULT 'draft' NOT NULL,
  	"availability" "enum_trucks_availability" DEFAULT 'available' NOT NULL,
  	"featured" boolean DEFAULT false,
  	"review_note" varchar,
  	"stock_number" varchar,
  	"slug" varchar,
  	"assigned_employee_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"sold_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trucks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"message" varchar,
  	"source" "enum_leads_source" NOT NULL,
  	"truck_of_interest_id" integer,
  	"financing_interest" boolean DEFAULT false,
  	"trade_in" boolean DEFAULT false,
  	"trade_in_year_make_model" varchar,
  	"trade_in_mileage" numeric,
  	"trade_in_condition" varchar,
  	"heard_about_us" "enum_leads_heard_about_us",
  	"website" varchar,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"internal_notes" varchar,
  	"received_at" timestamp(3) with time zone,
  	"contacted_at" timestamp(3) with time zone,
  	"closed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fleet_inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar NOT NULL,
  	"contact_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"fleet_size" "enum_fleet_inquiries_fleet_size" NOT NULL,
  	"timeline" "enum_fleet_inquiries_timeline" NOT NULL,
  	"trucks_needed" varchar NOT NULL,
  	"heard_about_us" "enum_fleet_inquiries_heard_about_us",
  	"website" varchar,
  	"status" "enum_fleet_inquiries_status" DEFAULT 'new' NOT NULL,
  	"internal_notes" varchar,
  	"received_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_block_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"num" varchar,
  	"title" varchar NOT NULL,
  	"desc" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_info_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_info_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"body" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_type" "enum_pages_blocks_form_block_form_type" NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_map_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_map_block_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_block_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_pages_slug" NOT NULL,
  	"title" varchar NOT NULL,
  	"meta_description" varchar,
  	"hero_label" varchar,
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'employee' NOT NULL,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trucks_id" integer,
  	"leads_id" integer,
  	"fleet_inquiries_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Sparta Motors',
  	"phone" varchar,
  	"email" varchar,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_zip" varchar,
  	"address_latitude" numeric,
  	"address_longitude" numeric,
  	"hours_mon_fri" varchar DEFAULT '8 AM – 5 PM',
  	"hours_sat" varchar DEFAULT 'By appointment',
  	"hours_sun" varchar DEFAULT 'Closed',
  	"social_facebook" varchar,
  	"social_instagram" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "trucks_inspection_points" ADD CONSTRAINT "trucks_inspection_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trucks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trucks" ADD CONSTRAINT "trucks_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trucks" ADD CONSTRAINT "trucks_spec_sheet_id_media_id_fk" FOREIGN KEY ("spec_sheet_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trucks" ADD CONSTRAINT "trucks_assigned_employee_id_users_id_fk" FOREIGN KEY ("assigned_employee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trucks_rels" ADD CONSTRAINT "trucks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trucks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trucks_rels" ADD CONSTRAINT "trucks_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_truck_of_interest_id_trucks_id_fk" FOREIGN KEY ("truck_of_interest_id") REFERENCES "public"."trucks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD CONSTRAINT "pages_blocks_steps_block_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_block" ADD CONSTRAINT "pages_blocks_steps_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_info_list_block_items" ADD CONSTRAINT "pages_blocks_info_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_info_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_info_list_block" ADD CONSTRAINT "pages_blocks_info_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_block" ADD CONSTRAINT "pages_blocks_callout_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_block" ADD CONSTRAINT "pages_blocks_map_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_block_stats" ADD CONSTRAINT "pages_blocks_stats_block_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_block" ADD CONSTRAINT "pages_blocks_stats_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_block" ADD CONSTRAINT "pages_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trucks_fk" FOREIGN KEY ("trucks_id") REFERENCES "public"."trucks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fleet_inquiries_fk" FOREIGN KEY ("fleet_inquiries_id") REFERENCES "public"."fleet_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "trucks_inspection_points_order_idx" ON "trucks_inspection_points" USING btree ("_order");
  CREATE INDEX "trucks_inspection_points_parent_id_idx" ON "trucks_inspection_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "trucks_vin_idx" ON "trucks" USING btree ("vin");
  CREATE INDEX "trucks_video_file_idx" ON "trucks" USING btree ("video_file_id");
  CREATE INDEX "trucks_spec_sheet_idx" ON "trucks" USING btree ("spec_sheet_id");
  CREATE INDEX "trucks_slug_idx" ON "trucks" USING btree ("slug");
  CREATE INDEX "trucks_assigned_employee_idx" ON "trucks" USING btree ("assigned_employee_id");
  CREATE INDEX "trucks_updated_at_idx" ON "trucks" USING btree ("updated_at");
  CREATE INDEX "trucks_created_at_idx" ON "trucks" USING btree ("created_at");
  CREATE INDEX "trucks_rels_order_idx" ON "trucks_rels" USING btree ("order");
  CREATE INDEX "trucks_rels_parent_idx" ON "trucks_rels" USING btree ("parent_id");
  CREATE INDEX "trucks_rels_path_idx" ON "trucks_rels" USING btree ("path");
  CREATE INDEX "trucks_rels_media_id_idx" ON "trucks_rels" USING btree ("media_id");
  CREATE INDEX "leads_truck_of_interest_idx" ON "leads" USING btree ("truck_of_interest_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "fleet_inquiries_updated_at_idx" ON "fleet_inquiries" USING btree ("updated_at");
  CREATE INDEX "fleet_inquiries_created_at_idx" ON "fleet_inquiries" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "pages_blocks_steps_block_steps_order_idx" ON "pages_blocks_steps_block_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_block_steps_parent_id_idx" ON "pages_blocks_steps_block_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_block_order_idx" ON "pages_blocks_steps_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_block_parent_id_idx" ON "pages_blocks_steps_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_block_path_idx" ON "pages_blocks_steps_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_info_list_block_items_order_idx" ON "pages_blocks_info_list_block_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_info_list_block_items_parent_id_idx" ON "pages_blocks_info_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_info_list_block_order_idx" ON "pages_blocks_info_list_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_info_list_block_parent_id_idx" ON "pages_blocks_info_list_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_info_list_block_path_idx" ON "pages_blocks_info_list_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_block_order_idx" ON "pages_blocks_callout_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_block_parent_id_idx" ON "pages_blocks_callout_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_block_path_idx" ON "pages_blocks_callout_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_block_order_idx" ON "pages_blocks_map_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_block_parent_id_idx" ON "pages_blocks_map_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_block_path_idx" ON "pages_blocks_map_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_block_stats_order_idx" ON "pages_blocks_stats_block_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_block_stats_parent_id_idx" ON "pages_blocks_stats_block_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_block_order_idx" ON "pages_blocks_stats_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_block_parent_id_idx" ON "pages_blocks_stats_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_block_path_idx" ON "pages_blocks_stats_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_block_order_idx" ON "pages_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_block_parent_id_idx" ON "pages_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_block_path_idx" ON "pages_blocks_rich_text_block" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_trucks_id_idx" ON "payload_locked_documents_rels" USING btree ("trucks_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_fleet_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("fleet_inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "trucks_inspection_points" CASCADE;
  DROP TABLE "trucks" CASCADE;
  DROP TABLE "trucks_rels" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "fleet_inquiries" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_steps_block_steps" CASCADE;
  DROP TABLE "pages_blocks_steps_block" CASCADE;
  DROP TABLE "pages_blocks_info_list_block_items" CASCADE;
  DROP TABLE "pages_blocks_info_list_block" CASCADE;
  DROP TABLE "pages_blocks_callout_block" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages_blocks_map_block" CASCADE;
  DROP TABLE "pages_blocks_stats_block_stats" CASCADE;
  DROP TABLE "pages_blocks_stats_block" CASCADE;
  DROP TABLE "pages_blocks_rich_text_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_trucks_inspection_points_area";
  DROP TYPE "public"."enum_trucks_inspection_points_rating";
  DROP TYPE "public"."enum_trucks_make";
  DROP TYPE "public"."enum_trucks_body_type";
  DROP TYPE "public"."enum_trucks_condition";
  DROP TYPE "public"."enum_trucks_title_status";
  DROP TYPE "public"."enum_trucks_fuel_type";
  DROP TYPE "public"."enum_trucks_payload_class";
  DROP TYPE "public"."enum_trucks_drivetrain";
  DROP TYPE "public"."enum_trucks_status";
  DROP TYPE "public"."enum_trucks_availability";
  DROP TYPE "public"."enum_leads_source";
  DROP TYPE "public"."enum_leads_heard_about_us";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_fleet_inquiries_fleet_size";
  DROP TYPE "public"."enum_fleet_inquiries_timeline";
  DROP TYPE "public"."enum_fleet_inquiries_heard_about_us";
  DROP TYPE "public"."enum_fleet_inquiries_status";
  DROP TYPE "public"."enum_pages_blocks_form_block_form_type";
  DROP TYPE "public"."enum_pages_blocks_map_block_size";
  DROP TYPE "public"."enum_pages_slug";
  DROP TYPE "public"."enum_users_role";`)
}
