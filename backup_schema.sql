

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."contract_status" AS ENUM (
    'draft',
    'sent',
    'signed',
    'expired',
    'archived'
);


ALTER TYPE "public"."contract_status" OWNER TO "postgres";


CREATE TYPE "public"."participant_type" AS ENUM (
    'ARTISTA',
    'PRODUCTOR',
    'COMPOSITOR',
    'MANAGER',
    'LAWYER'
);


ALTER TYPE "public"."participant_type" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'released',
    'cancelled'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."project_type" AS ENUM (
    'single',
    'album',
    'ep',
    'mixtape'
);


ALTER TYPE "public"."project_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_artists_for_admin"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Ensure only admins can run this function
    IF get_my_role() <> 'admin' THEN
        RAISE EXCEPTION 'Only admins can call this function.';
    END IF;

    RETURN (
        SELECT json_agg(artist_data)
        FROM (
            SELECT
                a.id,
                a.created_at,
                a.name,
                a.genre,
                a.country,
                a.profile_image,
                a.bio,
                a.monthly_listeners,
                a.total_streams,
                a.user_id,
                (SELECT json_agg(sa.*) FROM social_accounts sa WHERE sa.artist_id = a.id) as social_accounts,
                (SELECT json_agg(da.*) FROM distribution_accounts da WHERE da.artist_id = a.id) as distribution_accounts,
                (
                    SELECT json_agg(p_assets)
                    FROM (
                        SELECT 
                            p.name, 
                            p.release_date,
                            (SELECT json_agg(assets.*) FROM assets WHERE assets.project_id = p.id) as assets
                        FROM projects p
                        WHERE p.artist_id = a.id
                    ) p_assets
                ) as projects
            FROM
                artists a
        ) artist_data
    );
END;
$$;


ALTER FUNCTION "public"."get_all_artists_for_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_users"() RETURNS TABLE("id" "uuid", "email" "text", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- This function should only be callable by authenticated admins.
  IF get_my_role() <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can call this function.';
  END IF;

  RETURN QUERY
    SELECT u.id, u.email::text, (u.raw_app_meta_data ->> 'role')::text AS role
    FROM auth.users u;
END;
$$;


ALTER FUNCTION "public"."get_all_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_users_for_app"() RETURNS TABLE("id" "uuid", "email" "text", "raw_user_meta_data" "jsonb")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT id, email, raw_user_meta_data FROM auth.users;
$$;


ALTER FUNCTION "public"."get_all_users_for_app"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_contracts_with_details"("is_admin" boolean, "user_id_param" "uuid") RETURNS TABLE("id" "uuid", "work_id" "uuid", "template_id" integer, "status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "work_name" "text", "template_type" "text", "template_version" "text", "participants" json)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.work_id,
    c.template_id,
    c.status,
    c.created_at,
    c.updated_at,
    w.name as work_name,
    t.type as template_type,
    t.version as template_version,
    json_agg(json_build_object('id', p.id, 'name', p.name, 'role', cp.role)) as participants
  FROM public.contracts c
  LEFT JOIN public.projects w ON c.work_id = w.id
  LEFT JOIN public.templates t ON c.template_id = t.id
  LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
  LEFT JOIN public.participants p ON cp.participant_id = p.id
  WHERE is_admin OR c.id IN (
    SELECT contract_id FROM public.contract_participants WHERE participant_id IN (
      SELECT id FROM public.participants WHERE user_id = user_id_param
    )
  )
  GROUP BY c.id, w.name, t.type, t.version;
END;
$$;


ALTER FUNCTION "public"."get_contracts_with_details"("is_admin" boolean, "user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_db_size_mb"() RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
     DECLARE
         db_size_mb numeric;
     BEGIN
         SELECT sum(pg_database_size(pg_database.datname)) / (1024 * 1024) INTO db_size_mb
      FROM pg_database;
         RETURN db_size_mb;
    END;
    $$;


ALTER FUNCTION "public"."get_db_size_mb"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')::text;
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_asset_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_asset_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_asset_artist_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    SELECT artist_id INTO NEW.artist_id
    FROM public.projects
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_asset_artist_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "genre" "text" NOT NULL,
    "country" "text" NOT NULL,
    "profile_image" "text",
    "bio" "text",
    "monthly_listeners" integer DEFAULT 0,
    "total_streams" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "spotify_artist_id" "text",
    "first_name" "text",
    "last_name" "text",
    "date_of_birth" "date",
    "participant_id" "uuid"
);


ALTER TABLE "public"."artists" OWNER TO "postgres";


COMMENT ON COLUMN "public"."artists"."spotify_artist_id" IS 'The unique Spotify ID for the artist profile.';



CREATE TABLE IF NOT EXISTS "public"."assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_size" integer,
    "dimensions" "text",
    "format" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audience_reports" (
    "id" bigint NOT NULL,
    "artist_id" "uuid",
    "report_date" "date" NOT NULL,
    "listeners" integer,
    "streams" integer,
    "followers" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audience_reports" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."audience_reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."audience_reports_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."audience_reports_id_seq" OWNED BY "public"."audience_reports"."id";



CREATE TABLE IF NOT EXISTS "public"."contract_participants" (
    "contract_id" bigint NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "percentage" numeric
);


ALTER TABLE "public"."contract_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" bigint NOT NULL,
    "project_id" "uuid" NOT NULL,
    "template_id" bigint NOT NULL,
    "status" "public"."contract_status" DEFAULT 'draft'::"public"."contract_status" NOT NULL,
    "final_contract_pdf_url" "text",
    "signed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "internal_reference" "text",
    "signing_location" "text",
    "additional_notes" "text",
    "publisher" "text",
    "publisher_percentage" numeric,
    "co_publishers" "text",
    "publisher_admin" "text"
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


ALTER TABLE "public"."contracts" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."contracts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."creative_vault_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "file_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."creative_vault_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."distribution_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "distributor" "text" NOT NULL,
    "username" "text",
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "account_id" "text",
    "email" "text",
    "access_token_encrypted" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "service" "text" NOT NULL,
    "monthly_listeners" integer DEFAULT 0,
    "password" "text",
    "notes" "text",
    "platform" "text",
    "access_token" "text",
    "refresh_token" "text",
    "token_expires_at" timestamp with time zone,
    "analytics_status" "text" DEFAULT 'disconnected'::"text",
    "last_synced_at" timestamp with time zone,
    "provider" "text"
);


ALTER TABLE "public"."distribution_accounts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."distribution_accounts"."access_token" IS 'Encrypted Spotify access token.';



COMMENT ON COLUMN "public"."distribution_accounts"."refresh_token" IS 'Encrypted Spotify refresh token.';



COMMENT ON COLUMN "public"."distribution_accounts"."analytics_status" IS 'The status of the analytics integration (e.g., connected, disconnected, error).';



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "category" "text",
    "all_day" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."events"."artist_id" IS 'The artist this event belongs to.';



COMMENT ON COLUMN "public"."events"."user_id" IS 'The user who owns this event.';



COMMENT ON COLUMN "public"."events"."project_id" IS 'Optional link to a specific project/release.';



COMMENT ON COLUMN "public"."events"."title" IS 'The title or name of the event.';



COMMENT ON COLUMN "public"."events"."start_time" IS 'The start date and time of the event.';



COMMENT ON COLUMN "public"."events"."end_time" IS 'The end date and time of the event.';



COMMENT ON COLUMN "public"."events"."category" IS 'Event category (e.g., Release, Concert, Marketing, Personal).';



COMMENT ON COLUMN "public"."events"."all_day" IS 'Indicates if the event is an all-day event.';



CREATE TABLE IF NOT EXISTS "public"."muso_ai_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid",
    "muso_ai_profile_id" "text" NOT NULL,
    "popularity" integer,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_data" "jsonb"
);


ALTER TABLE "public"."muso_ai_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."oauth_state" (
    "state" "text" NOT NULL,
    "user_id" "uuid",
    "distribution_account_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."oauth_state" OWNER TO "postgres";


COMMENT ON TABLE "public"."oauth_state" IS 'Stores temporary state values for OAuth 2.0 flows to prevent CSRF attacks.';



CREATE TABLE IF NOT EXISTS "public"."participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "public"."participant_type" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "id_number" "text",
    "address" "text",
    "country" "text",
    "phone" "text",
    "bank_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "artistic_name" "text",
    "management_entity" "text",
    "ipi" "text"
);


ALTER TABLE "public"."participants" OWNER TO "postgres";


COMMENT ON TABLE "public"."participants" IS 'Stores information about all participants (artists, managers, producers, etc.) in the CRM.';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "public"."project_type" NOT NULL,
    "status" "public"."project_status" DEFAULT 'planned'::"public"."project_status" NOT NULL,
    "release_date" "date",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "cover_art_url" "text",
    "notes" "text",
    "music_file_url" "text",
    "isrc" "text",
    "upc" "text",
    "genre" "text",
    "duration" integer,
    "alternative_title" "text",
    "iswc" "text",
    "producers" "text"[],
    "composers" "text"[],
    "credits" "text",
    "lyrics" "text",
    "splits" "jsonb"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."royalties" (
    "id" bigint NOT NULL,
    "report_id" "uuid" NOT NULL,
    "song_title" "text" NOT NULL,
    "platform" "text" NOT NULL,
    "country" "text" NOT NULL,
    "revenue" numeric(10,4) NOT NULL,
    "quantity" integer,
    "isrc" "text",
    "artist_id" "uuid"
);


ALTER TABLE "public"."royalties" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."royalties_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."royalties_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."royalties_id_seq" OWNED BY "public"."royalties"."id";



CREATE TABLE IF NOT EXISTS "public"."royalty_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text" NOT NULL,
    "status" "text" DEFAULT 'uploaded'::"text" NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."royalty_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signatures" (
    "id" bigint NOT NULL,
    "contract_id" bigint NOT NULL,
    "signature_request_id" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "signer_email" "text" NOT NULL,
    "signed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."signatures" OWNER TO "postgres";


ALTER TABLE "public"."signatures" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."signatures_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."social_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "username" "text" NOT NULL,
    "followers" integer DEFAULT 0,
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "handle" "text",
    "password_encrypted" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "password" "text",
    "email" "text"
);


ALTER TABLE "public"."social_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "language" character varying(10) NOT NULL,
    "template_html" "text" NOT NULL,
    "version" character varying(20) NOT NULL,
    "jurisdiction" character varying(50)
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


ALTER TABLE "public"."templates" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."transaction_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL
);


ALTER TABLE "public"."transaction_categories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transaction_categories"."user_id" IS 'The user who owns this category.';



COMMENT ON COLUMN "public"."transaction_categories"."name" IS 'Name of the category (e.g., Streaming, Merch, Production).';



COMMENT ON COLUMN "public"."transaction_categories"."type" IS 'Type of the category (income or expense).';



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "transaction_date" "date" NOT NULL,
    "type" "text" NOT NULL
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transactions"."artist_id" IS 'The artist this transaction belongs to.';



COMMENT ON COLUMN "public"."transactions"."user_id" IS 'The user who owns this transaction.';



COMMENT ON COLUMN "public"."transactions"."category_id" IS 'The category of this transaction.';



COMMENT ON COLUMN "public"."transactions"."amount" IS 'The amount of the transaction.';



COMMENT ON COLUMN "public"."transactions"."description" IS 'Description of the transaction.';



COMMENT ON COLUMN "public"."transactions"."transaction_date" IS 'The date the transaction occurred.';



COMMENT ON COLUMN "public"."transactions"."type" IS 'Type of the transaction (income or expense).';



CREATE OR REPLACE VIEW "public"."users_view" AS
 SELECT "id",
    "email",
    "raw_user_meta_data"
   FROM "auth"."users";


ALTER VIEW "public"."users_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_participants" (
    "project_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_participants" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audience_reports" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audience_reports_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."royalties" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."royalties_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audience_reports"
    ADD CONSTRAINT "audience_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contract_participants"
    ADD CONSTRAINT "contract_participants_pkey" PRIMARY KEY ("contract_id", "participant_id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creative_vault_items"
    ADD CONSTRAINT "creative_vault_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."distribution_accounts"
    ADD CONSTRAINT "distribution_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."muso_ai_profiles"
    ADD CONSTRAINT "muso_ai_profiles_muso_ai_profile_id_key" UNIQUE ("muso_ai_profile_id");



ALTER TABLE ONLY "public"."muso_ai_profiles"
    ADD CONSTRAINT "muso_ai_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oauth_state"
    ADD CONSTRAINT "oauth_state_pkey" PRIMARY KEY ("state");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."royalties"
    ADD CONSTRAINT "royalties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."royalty_reports"
    ADD CONSTRAINT "royalty_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signatures"
    ADD CONSTRAINT "signatures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_accounts"
    ADD CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transaction_categories"
    ADD CONSTRAINT "transaction_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "unique_artist_participant_id" UNIQUE ("participant_id");



ALTER TABLE ONLY "public"."transaction_categories"
    ADD CONSTRAINT "unique_category_name_per_user" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "unique_project_name" UNIQUE ("name");



ALTER TABLE ONLY "public"."work_participants"
    ADD CONSTRAINT "work_participants_pkey" PRIMARY KEY ("project_id", "participant_id");



CREATE UNIQUE INDEX "artists_spotify_artist_id_key_nullable" ON "public"."artists" USING "btree" ("spotify_artist_id") WHERE ("spotify_artist_id" IS NOT NULL);



CREATE INDEX "idx_artists_participant_id" ON "public"."artists" USING "btree" ("participant_id");



CREATE INDEX "idx_artists_user_id" ON "public"."artists" USING "btree" ("user_id");



CREATE INDEX "idx_distribution_accounts_artist_id" ON "public"."distribution_accounts" USING "btree" ("artist_id");



CREATE INDEX "idx_distribution_accounts_service" ON "public"."distribution_accounts" USING "btree" ("service");



CREATE INDEX "idx_events_artist_id" ON "public"."events" USING "btree" ("artist_id");



CREATE INDEX "idx_events_end_time" ON "public"."events" USING "btree" ("end_time");



CREATE INDEX "idx_events_start_time" ON "public"."events" USING "btree" ("start_time");



CREATE INDEX "idx_events_user_id" ON "public"."events" USING "btree" ("user_id");



CREATE INDEX "idx_participants_email" ON "public"."participants" USING "btree" ("email");



CREATE INDEX "idx_participants_type" ON "public"."participants" USING "btree" ("type");



CREATE INDEX "idx_participants_user_id" ON "public"."participants" USING "btree" ("user_id");



CREATE INDEX "idx_projects_artist_id" ON "public"."projects" USING "btree" ("artist_id");



CREATE INDEX "idx_projects_release_date" ON "public"."projects" USING "btree" ("release_date");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_social_accounts_artist_id" ON "public"."social_accounts" USING "btree" ("artist_id");



CREATE INDEX "idx_transaction_categories_user_id" ON "public"."transaction_categories" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_artist_id" ON "public"."transactions" USING "btree" ("artist_id");



CREATE INDEX "idx_transactions_category_id" ON "public"."transactions" USING "btree" ("category_id");



CREATE INDEX "idx_transactions_date" ON "public"."transactions" USING "btree" ("transaction_date");



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE INDEX "oauth_state_created_at_idx" ON "public"."oauth_state" USING "btree" ("created_at");



CREATE UNIQUE INDEX "ux_distribution_accounts_nonnull" ON "public"."distribution_accounts" USING "btree" ("artist_id", "service", "account_id") WHERE ("account_id" IS NOT NULL);



CREATE UNIQUE INDEX "ux_distribution_accounts_null" ON "public"."distribution_accounts" USING "btree" ("artist_id", "service") WHERE ("account_id" IS NULL);



CREATE OR REPLACE TRIGGER "on_asset_update" BEFORE UPDATE ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_asset_update"();



CREATE OR REPLACE TRIGGER "set_distribution_accounts_timestamp" BEFORE UPDATE ON "public"."distribution_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_social_accounts_timestamp" BEFORE UPDATE ON "public"."social_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_distribution_accounts_updated" BEFORE UPDATE ON "public"."distribution_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_social_accounts_updated" BEFORE UPDATE ON "public"."social_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audience_reports"
    ADD CONSTRAINT "audience_reports_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contract_participants"
    ADD CONSTRAINT "contract_participants_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contract_participants"
    ADD CONSTRAINT "contract_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_work_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."creative_vault_items"
    ADD CONSTRAINT "creative_vault_items_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."distribution_accounts"
    ADD CONSTRAINT "distribution_accounts_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "fk_artists_participant" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."muso_ai_profiles"
    ADD CONSTRAINT "muso_ai_profiles_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."oauth_state"
    ADD CONSTRAINT "oauth_state_distribution_account_id_fkey" FOREIGN KEY ("distribution_account_id") REFERENCES "public"."distribution_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."oauth_state"
    ADD CONSTRAINT "oauth_state_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."royalties"
    ADD CONSTRAINT "royalties_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id");



ALTER TABLE ONLY "public"."royalties"
    ADD CONSTRAINT "royalties_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."royalty_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."royalty_reports"
    ADD CONSTRAINT "royalty_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."signatures"
    ADD CONSTRAINT "signatures_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_accounts"
    ADD CONSTRAINT "social_accounts_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transaction_categories"
    ADD CONSTRAINT "transaction_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."transaction_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_participants"
    ADD CONSTRAINT "work_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_participants"
    ADD CONSTRAINT "work_participants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete creative vault items." ON "public"."creative_vault_items" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can insert creative vault items." ON "public"."creative_vault_items" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage all muso_ai_profiles" ON "public"."muso_ai_profiles" USING (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Admins can update creative vault items." ON "public"."creative_vault_items" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can view all creative vault items." ON "public"."creative_vault_items" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins have full access to participants." ON "public"."participants" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admins have full access to signatures." ON "public"."signatures" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin to delete contracts" ON "public"."contracts" FOR DELETE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin to insert new contracts" ON "public"."contracts" FOR INSERT WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin to update contracts" ON "public"."contracts" FOR UPDATE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow all operations on assets" ON "public"."assets" USING (true);



CREATE POLICY "Allow all operations on projects" ON "public"."projects" USING (true);



CREATE POLICY "Allow all users to view royalties" ON "public"."royalties" FOR SELECT USING (true);



CREATE POLICY "Allow all users to view royalty reports" ON "public"."royalty_reports" FOR SELECT USING (true);



CREATE POLICY "Allow authenticated users to insert royalty reports" ON "public"."royalty_reports" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow read access to all users" ON "public"."contract_participants" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."templates" FOR SELECT USING (true);



CREATE POLICY "Artists can create their own profile." ON "public"."artists" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Artists can delete their own creative vault items." ON "public"."creative_vault_items" FOR DELETE USING (("artist_id" = ( SELECT "artists"."id"
   FROM "public"."artists"
  WHERE ("artists"."user_id" = "auth"."uid"()))));



CREATE POLICY "Artists can delete their own profile." ON "public"."artists" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Artists can insert their own creative vault items." ON "public"."creative_vault_items" FOR INSERT WITH CHECK (("artist_id" = ( SELECT "artists"."id"
   FROM "public"."artists"
  WHERE ("artists"."user_id" = "auth"."uid"()))));



CREATE POLICY "Artists can update their own creative vault items." ON "public"."creative_vault_items" FOR UPDATE USING (("artist_id" = ( SELECT "artists"."id"
   FROM "public"."artists"
  WHERE ("artists"."user_id" = "auth"."uid"()))));



CREATE POLICY "Artists can update their own profile." ON "public"."artists" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Artists can view their own creative vault items." ON "public"."creative_vault_items" FOR SELECT USING (("artist_id" = ( SELECT "artists"."id"
   FROM "public"."artists"
  WHERE ("artists"."user_id" = "auth"."uid"()))));



CREATE POLICY "Artists can view their own profile." ON "public"."artists" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable CRUD for owners and admins" ON "public"."artists" USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"())) WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Enable CRUD for owners and admins" ON "public"."assets" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM ("public"."artists"
     JOIN "public"."projects" ON (("projects"."artist_id" = "artists"."id")))
  WHERE (("assets"."project_id" = "projects"."id") AND ("artists"."user_id" = "auth"."uid"())))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM ("public"."artists"
     JOIN "public"."projects" ON (("projects"."artist_id" = "artists"."id")))
  WHERE (("assets"."project_id" = "projects"."id") AND ("artists"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable CRUD for owners and admins" ON "public"."events" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "events"."artist_id") AND ("artists"."user_id" = "auth"."uid"())))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "events"."artist_id") AND ("artists"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable CRUD for owners and admins on distribution_accounts" ON "public"."distribution_accounts" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "distribution_accounts"."artist_id") AND ("artists"."user_id" = "auth"."uid"())))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "distribution_accounts"."artist_id") AND ("artists"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable CRUD for owners and admins on projects" ON "public"."projects" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "projects"."artist_id") AND ("artists"."user_id" = "auth"."uid"())))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "projects"."artist_id") AND ("artists"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable CRUD for owners and admins on social_accounts" ON "public"."social_accounts" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "social_accounts"."artist_id") AND ("artists"."user_id" = "auth"."uid"())))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "social_accounts"."artist_id") AND ("artists"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable CRUD for owners and admins on transaction_categories" ON "public"."transaction_categories" USING (("public"."is_admin"() OR ("auth"."uid"() = "user_id"))) WITH CHECK (("public"."is_admin"() OR ("auth"."uid"() = "user_id")));



CREATE POLICY "Enable CRUD for owners and admins on transactions" ON "public"."transactions" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "transactions"."artist_id") AND ("artists"."user_id" = "auth"."uid"())))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."artists"
  WHERE (("artists"."id" = "transactions"."artist_id") AND ("artists"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable delete for authenticated users" ON "public"."muso_ai_profiles" FOR DELETE USING (("auth"."uid"() = ( SELECT "artists"."user_id"
   FROM "public"."artists"
  WHERE ("artists"."id" = "muso_ai_profiles"."artist_id"))));



CREATE POLICY "Enable insert for authenticated users" ON "public"."muso_ai_profiles" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."muso_ai_profiles" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."muso_ai_profiles" FOR UPDATE USING (("auth"."uid"() = ( SELECT "artists"."user_id"
   FROM "public"."artists"
  WHERE ("artists"."id" = "muso_ai_profiles"."artist_id")))) WITH CHECK (("auth"."uid"() = ( SELECT "artists"."user_id"
   FROM "public"."artists"
  WHERE ("artists"."id" = "muso_ai_profiles"."artist_id"))));



CREATE POLICY "Los participantes de las obras son visibles por todos." ON "public"."work_participants" FOR SELECT USING (true);



CREATE POLICY "Los usuarios autenticados pueden añadir participantes a las ob" ON "public"."work_participants" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can create their own projects." ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can update their own participant data." ON "public"."participants" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view contracts they are a part of" ON "public"."contracts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."participants" "p"
     JOIN "public"."contract_participants" "cp" ON (("p"."id" = "cp"."participant_id")))
  WHERE (("cp"."contract_id" = "contracts"."id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view signatures for their contracts" ON "public"."signatures" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (("public"."contracts" "c"
     JOIN "public"."contract_participants" "cp" ON (("c"."id" = "cp"."contract_id")))
     JOIN "public"."participants" "p" ON (("cp"."participant_id" = "p"."id")))
  WHERE (("c"."id" = "signatures"."contract_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own participant data." ON "public"."participants" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."artists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audience_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contract_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creative_vault_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dist_delete_own" ON "public"."distribution_accounts" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "dist_insert_own" ON "public"."distribution_accounts" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "dist_select_authenticated" ON "public"."distribution_accounts" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "dist_update_own" ON "public"."distribution_accounts" FOR UPDATE USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."distribution_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."muso_ai_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."royalties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."royalty_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."signatures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_accounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "social_delete_own" ON "public"."social_accounts" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "social_insert_own" ON "public"."social_accounts" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "social_select_authenticated" ON "public"."social_accounts" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "social_update_own" ON "public"."social_accounts" FOR UPDATE USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transaction_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_participants" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_all_artists_for_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_artists_for_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_artists_for_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_users_for_app"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_users_for_app"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users_for_app"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_contracts_with_details"("is_admin" boolean, "user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_contracts_with_details"("is_admin" boolean, "user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_contracts_with_details"("is_admin" boolean, "user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_db_size_mb"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_db_size_mb"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_db_size_mb"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_asset_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_asset_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_asset_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_asset_artist_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_asset_artist_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_asset_artist_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";


















GRANT ALL ON TABLE "public"."artists" TO "anon";
GRANT ALL ON TABLE "public"."artists" TO "authenticated";
GRANT ALL ON TABLE "public"."artists" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";



GRANT ALL ON TABLE "public"."audience_reports" TO "anon";
GRANT ALL ON TABLE "public"."audience_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."audience_reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audience_reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audience_reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audience_reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contract_participants" TO "anon";
GRANT ALL ON TABLE "public"."contract_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_participants" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contracts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contracts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contracts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."creative_vault_items" TO "anon";
GRANT ALL ON TABLE "public"."creative_vault_items" TO "authenticated";
GRANT ALL ON TABLE "public"."creative_vault_items" TO "service_role";



GRANT ALL ON TABLE "public"."distribution_accounts" TO "anon";
GRANT ALL ON TABLE "public"."distribution_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."distribution_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."muso_ai_profiles" TO "anon";
GRANT ALL ON TABLE "public"."muso_ai_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."muso_ai_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."oauth_state" TO "anon";
GRANT ALL ON TABLE "public"."oauth_state" TO "authenticated";
GRANT ALL ON TABLE "public"."oauth_state" TO "service_role";



GRANT ALL ON TABLE "public"."participants" TO "anon";
GRANT ALL ON TABLE "public"."participants" TO "authenticated";
GRANT ALL ON TABLE "public"."participants" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."royalties" TO "anon";
GRANT ALL ON TABLE "public"."royalties" TO "authenticated";
GRANT ALL ON TABLE "public"."royalties" TO "service_role";



GRANT ALL ON SEQUENCE "public"."royalties_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."royalties_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."royalties_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."royalty_reports" TO "anon";
GRANT ALL ON TABLE "public"."royalty_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."royalty_reports" TO "service_role";



GRANT ALL ON TABLE "public"."signatures" TO "anon";
GRANT ALL ON TABLE "public"."signatures" TO "authenticated";
GRANT ALL ON TABLE "public"."signatures" TO "service_role";



GRANT ALL ON SEQUENCE "public"."signatures_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."signatures_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."signatures_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."social_accounts" TO "anon";
GRANT ALL ON TABLE "public"."social_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."social_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."transaction_categories" TO "anon";
GRANT ALL ON TABLE "public"."transaction_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_categories" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."users_view" TO "anon";
GRANT ALL ON TABLE "public"."users_view" TO "authenticated";
GRANT ALL ON TABLE "public"."users_view" TO "service_role";



GRANT ALL ON TABLE "public"."work_participants" TO "anon";
GRANT ALL ON TABLE "public"."work_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."work_participants" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
