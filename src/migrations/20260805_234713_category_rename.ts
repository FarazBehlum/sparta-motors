import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // The generated version of this migration cast straight to the new enum. That
  // throws "invalid input value for enum" on any row still holding 'day-cab' or
  // 'flat-bed', because those labels don't exist in the new type. The UPDATEs
  // below remap those rows while the column is still plain text, so the cast has
  // nothing left to choke on. Mapping matches the 301s in next.config.ts.
  await db.execute(sql`
   ALTER TABLE "trucks" ALTER COLUMN "body_type" SET DATA TYPE text;
  UPDATE "trucks" SET "body_type" = 'landscaper' WHERE "body_type" = 'day-cab';
  UPDATE "trucks" SET "body_type" = '26ft-box-truck' WHERE "body_type" = 'flat-bed';
  DROP TYPE "public"."enum_trucks_body_type";
  CREATE TYPE "public"."enum_trucks_body_type" AS ENUM('box-truck', 'reefer', 'landscaper', '26ft-box-truck', 'dump-truck', 'tow-truck');
  ALTER TABLE "trucks" ALTER COLUMN "body_type" SET DATA TYPE "public"."enum_trucks_body_type" USING "body_type"::"public"."enum_trucks_body_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Same hazard in reverse, and here it is unconditional: once any truck is
  // saved as 'landscaper' or '26ft-box-truck', an un-remapped rollback fails.
  // Note this direction is lossy in principle — a truck genuinely entered as a
  // landscaper comes back as a day cab — but rollback is a break-glass step and
  // failing outright would be worse than an approximate category.
  await db.execute(sql`
   ALTER TABLE "trucks" ALTER COLUMN "body_type" SET DATA TYPE text;
  UPDATE "trucks" SET "body_type" = 'day-cab' WHERE "body_type" = 'landscaper';
  UPDATE "trucks" SET "body_type" = 'flat-bed' WHERE "body_type" = '26ft-box-truck';
  DROP TYPE "public"."enum_trucks_body_type";
  CREATE TYPE "public"."enum_trucks_body_type" AS ENUM('box-truck', 'reefer', 'day-cab', 'flat-bed', 'dump-truck', 'tow-truck');
  ALTER TABLE "trucks" ALTER COLUMN "body_type" SET DATA TYPE "public"."enum_trucks_body_type" USING "body_type"::"public"."enum_trucks_body_type";`)
}
