import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Non-destructive: ADD VALUE appends to the existing enum, so no rows are
  // rewritten and no truck can fail a cast. Postgres 12+ allows this inside the
  // transaction Payload wraps migrations in; the only rule is that the new
  // labels can't be *used* until it commits, and nothing here inserts.
  await db.execute(sql`
   ALTER TYPE "public"."enum_trucks_body_type" ADD VALUE 'tank-truck';
  ALTER TYPE "public"."enum_trucks_body_type" ADD VALUE 'garbage-truck';
  ALTER TYPE "public"."enum_trucks_body_type" ADD VALUE 'specialty-truck';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Same hazard the category_rename migration hit: the generated version cast
  // straight to the shortened enum, which throws "invalid input value for enum"
  // on any truck already saved as one of the three new types. The UPDATEs remap
  // those rows while the column is still plain text, so the cast has nothing to
  // choke on. Lossy in principle (a real tank truck comes back as a box truck),
  // but rollback is a break-glass step and failing outright would be worse.
  await db.execute(sql`
   ALTER TABLE "trucks" ALTER COLUMN "body_type" SET DATA TYPE text;
  UPDATE "trucks" SET "body_type" = 'box-truck' WHERE "body_type" IN ('tank-truck', 'garbage-truck', 'specialty-truck');
  DROP TYPE "public"."enum_trucks_body_type";
  CREATE TYPE "public"."enum_trucks_body_type" AS ENUM('box-truck', 'reefer', 'landscaper', '26ft-box-truck', 'dump-truck', 'tow-truck');
  ALTER TABLE "trucks" ALTER COLUMN "body_type" SET DATA TYPE "public"."enum_trucks_body_type" USING "body_type"::"public"."enum_trucks_body_type";`)
}
