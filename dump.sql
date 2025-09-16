

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






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assessment_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assessment_id" "text" NOT NULL,
    "assessment_title" "text" NOT NULL,
    "score" integer NOT NULL,
    "level" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "responses" "jsonb" NOT NULL,
    "result_data" "jsonb" NOT NULL,
    "friendly_explanation" "text",
    "taken_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assessment_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."assessment_results" IS 'Individual assessment results - simplified system without session tracking';



CREATE TABLE IF NOT EXISTS "public"."conversation_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "message_count" integer DEFAULT 0 NOT NULL,
    "average_sentiment" numeric(3,2) DEFAULT 0.0 NOT NULL,
    "emotional_tone" "text" DEFAULT 'neutral'::"text" NOT NULL,
    "crisis_indicators" "text"[] DEFAULT '{}'::"text"[],
    "therapeutic_themes" "text"[] DEFAULT '{}'::"text"[],
    "user_engagement" "text" DEFAULT 'medium'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversation_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversation_progress" IS 'Tracks conversation analytics and progress for chat sessions';



CREATE TABLE IF NOT EXISTS "public"."listening_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "listener_id" "uuid" NOT NULL,
    "speaker_id" "uuid" NOT NULL,
    "session_type" "text" DEFAULT 'therapist'::"text" NOT NULL,
    "duration_minutes" integer DEFAULT 0 NOT NULL,
    "credits_transferred" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "listener_rating" integer,
    "speaker_rating" integer,
    "listener_feedback" "text",
    "speaker_feedback" "text",
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    CONSTRAINT "listening_sessions_listener_rating_check" CHECK ((("listener_rating" >= 1) AND ("listener_rating" <= 5))),
    CONSTRAINT "listening_sessions_session_type_check" CHECK (("session_type" = ANY (ARRAY['therapist'::"text", 'friend'::"text"]))),
    CONSTRAINT "listening_sessions_speaker_rating_check" CHECK ((("speaker_rating" >= 1) AND ("speaker_rating" <= 5))),
    CONSTRAINT "listening_sessions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."listening_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."listening_sessions" IS 'Tracks listening sessions between users (therapist/friend sessions)';



CREATE TABLE IF NOT EXISTS "public"."mood_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "mood_score" integer NOT NULL,
    "mood_label" "text",
    "emotional_capacity" "text",
    "seeking_support" boolean DEFAULT false,
    "willing_to_listen" boolean DEFAULT true,
    "notes" "text",
    "energy_level" integer,
    "stress_level" integer,
    "sleep_quality" integer,
    "social_activity" "text",
    "physical_activity" "text",
    "triggers" "text"[],
    "coping_strategies" "text"[],
    "metadata" "jsonb",
    CONSTRAINT "mood_entries_emotional_capacity_check" CHECK (("emotional_capacity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "mood_entries_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "mood_entries_mood_score_check" CHECK ((("mood_score" >= 1) AND ("mood_score" <= 10))),
    CONSTRAINT "mood_entries_sleep_quality_check" CHECK ((("sleep_quality" >= 1) AND ("sleep_quality" <= 10))),
    CONSTRAINT "mood_entries_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 10)))
);


ALTER TABLE "public"."mood_entries" OWNER TO "postgres";


COMMENT ON TABLE "public"."mood_entries" IS 'Tracks user mood entries and emotional state over time';



CREATE TABLE IF NOT EXISTS "public"."overall_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "overall_assessment_data" "jsonb" NOT NULL,
    "ai_analysis" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."overall_assessments" OWNER TO "postgres";


COMMENT ON TABLE "public"."overall_assessments" IS 'Stores comprehensive overall assessment results combining all individual assessments';



COMMENT ON COLUMN "public"."overall_assessments"."overall_assessment_data" IS 'Complete assessment data including all individual assessments and summary';



COMMENT ON COLUMN "public"."overall_assessments"."ai_analysis" IS 'AI-generated comprehensive analysis and recommendations';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text",
    "display_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "empathy_credits" integer DEFAULT 10 NOT NULL,
    "total_credits_earned" integer DEFAULT 10 NOT NULL,
    "total_credits_spent" integer DEFAULT 0 NOT NULL,
    "emotional_capacity" "text" DEFAULT 'medium'::"text" NOT NULL,
    "preferred_mode" "text" DEFAULT 'both'::"text" NOT NULL,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    "last_active" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_emotional_capacity_check" CHECK (("emotional_capacity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "profiles_preferred_mode_check" CHECK (("preferred_mode" = ANY (ARRAY['therapist'::"text", 'friend'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles with empathy credits and preferences for therapy sessions';



CREATE TABLE IF NOT EXISTS "public"."progress_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "insight_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "category" "text" NOT NULL,
    "actionable" boolean DEFAULT false NOT NULL,
    "action_url" "text",
    "metadata" "jsonb",
    "viewed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."progress_insights" OWNER TO "postgres";


COMMENT ON TABLE "public"."progress_insights" IS 'Stores generated insights and progress recommendations';



CREATE TABLE IF NOT EXISTS "public"."recommendation_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recommendation_id" "text" NOT NULL,
    "recommendation_type" "text" NOT NULL,
    "recommendation_title" "text" NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "feedback" "text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recommendation_tracking" OWNER TO "postgres";


COMMENT ON TABLE "public"."recommendation_tracking" IS 'Tracks completion of personalized recommendations';



CREATE TABLE IF NOT EXISTS "public"."user_assessment_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_data" "jsonb" NOT NULL,
    "trauma_history" "jsonb",
    "current_symptoms" "jsonb",
    "resilience_data" "jsonb",
    "risk_factors" "jsonb",
    "preferences" "jsonb",
    "personalization_data" "jsonb",
    "last_assessed" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_assessment_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_assessment_profiles" IS 'Processed user assessment data - no longer linked to sessions';



ALTER TABLE ONLY "public"."assessment_results"
    ADD CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_progress"
    ADD CONSTRAINT "conversation_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listening_sessions"
    ADD CONSTRAINT "listening_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mood_entries"
    ADD CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."overall_assessments"
    ADD CONSTRAINT "overall_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."progress_insights"
    ADD CONSTRAINT "progress_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recommendation_tracking"
    ADD CONSTRAINT "recommendation_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_assessment_profiles"
    ADD CONSTRAINT "user_assessment_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_assessment_results_assessment_id" ON "public"."assessment_results" USING "btree" ("assessment_id");



CREATE INDEX "idx_assessment_results_taken_at" ON "public"."assessment_results" USING "btree" ("taken_at");



CREATE INDEX "idx_assessment_results_user_id" ON "public"."assessment_results" USING "btree" ("user_id");



CREATE INDEX "idx_conversation_progress_session_id" ON "public"."conversation_progress" USING "btree" ("session_id");



CREATE INDEX "idx_conversation_progress_timestamp" ON "public"."conversation_progress" USING "btree" ("timestamp");



CREATE INDEX "idx_conversation_progress_user_id" ON "public"."conversation_progress" USING "btree" ("user_id");



CREATE INDEX "idx_listening_sessions_created_at" ON "public"."listening_sessions" USING "btree" ("created_at");



CREATE INDEX "idx_listening_sessions_listener_id" ON "public"."listening_sessions" USING "btree" ("listener_id");



CREATE INDEX "idx_listening_sessions_session_type" ON "public"."listening_sessions" USING "btree" ("session_type");



CREATE INDEX "idx_listening_sessions_speaker_id" ON "public"."listening_sessions" USING "btree" ("speaker_id");



CREATE INDEX "idx_listening_sessions_status" ON "public"."listening_sessions" USING "btree" ("status");



CREATE INDEX "idx_mood_entries_created_at" ON "public"."mood_entries" USING "btree" ("created_at");



CREATE INDEX "idx_mood_entries_mood_label" ON "public"."mood_entries" USING "btree" ("mood_label");



CREATE INDEX "idx_mood_entries_mood_score" ON "public"."mood_entries" USING "btree" ("mood_score");



CREATE INDEX "idx_mood_entries_user_id" ON "public"."mood_entries" USING "btree" ("user_id");



CREATE INDEX "idx_overall_assessments_updated_at" ON "public"."overall_assessments" USING "btree" ("updated_at");



CREATE INDEX "idx_overall_assessments_user_id" ON "public"."overall_assessments" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_emotional_capacity" ON "public"."profiles" USING "btree" ("emotional_capacity");



CREATE INDEX "idx_profiles_last_active" ON "public"."profiles" USING "btree" ("last_active");



CREATE INDEX "idx_profiles_preferred_mode" ON "public"."profiles" USING "btree" ("preferred_mode");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_progress_insights_created_at" ON "public"."progress_insights" USING "btree" ("created_at");



CREATE INDEX "idx_progress_insights_priority" ON "public"."progress_insights" USING "btree" ("priority");



CREATE INDEX "idx_progress_insights_user_id" ON "public"."progress_insights" USING "btree" ("user_id");



CREATE INDEX "idx_progress_insights_viewed" ON "public"."progress_insights" USING "btree" ("viewed");



CREATE INDEX "idx_recommendation_tracking_completed" ON "public"."recommendation_tracking" USING "btree" ("completed");



CREATE INDEX "idx_recommendation_tracking_recommendation_id" ON "public"."recommendation_tracking" USING "btree" ("recommendation_id");



CREATE INDEX "idx_recommendation_tracking_user_id" ON "public"."recommendation_tracking" USING "btree" ("user_id");



CREATE INDEX "idx_user_assessment_profiles_last_assessed" ON "public"."user_assessment_profiles" USING "btree" ("last_assessed");



CREATE INDEX "idx_user_assessment_profiles_user_id" ON "public"."user_assessment_profiles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_assessment_results_updated_at" BEFORE UPDATE ON "public"."assessment_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_conversation_progress_updated_at" BEFORE UPDATE ON "public"."conversation_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_overall_assessments_updated_at" BEFORE UPDATE ON "public"."overall_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_progress_insights_updated_at" BEFORE UPDATE ON "public"."progress_insights" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_recommendation_tracking_updated_at" BEFORE UPDATE ON "public"."recommendation_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_assessment_profiles_updated_at" BEFORE UPDATE ON "public"."user_assessment_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."assessment_results"
    ADD CONSTRAINT "assessment_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_progress"
    ADD CONSTRAINT "conversation_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listening_sessions"
    ADD CONSTRAINT "listening_sessions_listener_id_fkey" FOREIGN KEY ("listener_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listening_sessions"
    ADD CONSTRAINT "listening_sessions_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mood_entries"
    ADD CONSTRAINT "mood_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."overall_assessments"
    ADD CONSTRAINT "overall_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."progress_insights"
    ADD CONSTRAINT "progress_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendation_tracking"
    ADD CONSTRAINT "recommendation_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_assessment_profiles"
    ADD CONSTRAINT "user_assessment_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE "public"."assessment_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "assessment_results_insert_own" ON "public"."assessment_results" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "assessment_results_select_own" ON "public"."assessment_results" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "assessment_results_update_own" ON "public"."assessment_results" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."conversation_progress" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversation_progress_insert_own" ON "public"."conversation_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "conversation_progress_select_own" ON "public"."conversation_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "conversation_progress_update_own" ON "public"."conversation_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."listening_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listening_sessions_insert_own" ON "public"."listening_sessions" FOR INSERT WITH CHECK ((("auth"."uid"() = "listener_id") OR ("auth"."uid"() = "speaker_id")));



CREATE POLICY "listening_sessions_select_own" ON "public"."listening_sessions" FOR SELECT USING ((("auth"."uid"() = "listener_id") OR ("auth"."uid"() = "speaker_id")));



CREATE POLICY "listening_sessions_update_own" ON "public"."listening_sessions" FOR UPDATE USING ((("auth"."uid"() = "listener_id") OR ("auth"."uid"() = "speaker_id")));



ALTER TABLE "public"."mood_entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mood_entries_delete_own" ON "public"."mood_entries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "mood_entries_insert_own" ON "public"."mood_entries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "mood_entries_select_own" ON "public"."mood_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "mood_entries_update_own" ON "public"."mood_entries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."overall_assessments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "overall_assessments_delete_own" ON "public"."overall_assessments" FOR DELETE USING (("auth"."uid"() = "user_id"));



COMMENT ON POLICY "overall_assessments_delete_own" ON "public"."overall_assessments" IS 'Allows users to delete their own overall assessment records';



CREATE POLICY "overall_assessments_insert_own" ON "public"."overall_assessments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "overall_assessments_select_own" ON "public"."overall_assessments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "overall_assessments_update_own" ON "public"."overall_assessments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_public" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND (("emotional_capacity" IS NOT NULL) AND ("preferred_mode" IS NOT NULL))));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."progress_insights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "progress_insights_insert_own" ON "public"."progress_insights" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "progress_insights_select_own" ON "public"."progress_insights" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "progress_insights_update_own" ON "public"."progress_insights" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."recommendation_tracking" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "recommendation_tracking_insert_own" ON "public"."recommendation_tracking" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "recommendation_tracking_select_own" ON "public"."recommendation_tracking" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "recommendation_tracking_update_own" ON "public"."recommendation_tracking" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_assessment_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_assessment_profiles_insert_own" ON "public"."user_assessment_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_assessment_profiles_select_own" ON "public"."user_assessment_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_assessment_profiles_update_own" ON "public"."user_assessment_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."assessment_results" TO "anon";
GRANT ALL ON TABLE "public"."assessment_results" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_results" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_progress" TO "anon";
GRANT ALL ON TABLE "public"."conversation_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_progress" TO "service_role";



GRANT ALL ON TABLE "public"."listening_sessions" TO "anon";
GRANT ALL ON TABLE "public"."listening_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."listening_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."mood_entries" TO "anon";
GRANT ALL ON TABLE "public"."mood_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."mood_entries" TO "service_role";



GRANT ALL ON TABLE "public"."overall_assessments" TO "anon";
GRANT ALL ON TABLE "public"."overall_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."overall_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."progress_insights" TO "anon";
GRANT ALL ON TABLE "public"."progress_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."progress_insights" TO "service_role";



GRANT ALL ON TABLE "public"."recommendation_tracking" TO "anon";
GRANT ALL ON TABLE "public"."recommendation_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendation_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."user_assessment_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_assessment_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_assessment_profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
