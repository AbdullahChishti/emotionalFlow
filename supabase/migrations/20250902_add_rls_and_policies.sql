-- Enable RLS and add minimal policies for user data tables
-- Note: Ensure these tables exist before applying. Adjust names if your schema differs.

-- PROFILES
DO $$ BEGIN
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

-- Users can select/update only their own profile
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
  CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
  CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

-- INSERT typically handled by backend or upon signup; allow user to insert their own row
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
  CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

-- LISTENING SESSIONS
DO $$ BEGIN
  ALTER TABLE public.listening_sessions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

-- Participants (listener or speaker) can read
DO $$ BEGIN
  DROP POLICY IF EXISTS listening_sessions_select_participant ON public.listening_sessions;
  CREATE POLICY listening_sessions_select_participant ON public.listening_sessions
    FOR SELECT USING (auth.uid() = listener_id OR auth.uid() = speaker_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Participants may insert a session where they are involved
DO $$ BEGIN
  DROP POLICY IF EXISTS listening_sessions_insert_participant ON public.listening_sessions;
  CREATE POLICY listening_sessions_insert_participant ON public.listening_sessions
    FOR INSERT WITH CHECK (auth.uid() = listener_id OR auth.uid() = speaker_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Participants may update only their own sessions
DO $$ BEGIN
  DROP POLICY IF EXISTS listening_sessions_update_participant ON public.listening_sessions;
  CREATE POLICY listening_sessions_update_participant ON public.listening_sessions
    FOR UPDATE USING (auth.uid() = listener_id OR auth.uid() = speaker_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- EMOTIONAL LABOR LOGS
DO $$ BEGIN
  ALTER TABLE public.emotional_labor_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS emotional_labor_logs_select_own ON public.emotional_labor_logs;
  CREATE POLICY emotional_labor_logs_select_own ON public.emotional_labor_logs
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS emotional_labor_logs_insert_own ON public.emotional_labor_logs;
  CREATE POLICY emotional_labor_logs_insert_own ON public.emotional_labor_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Optionally allow updates by owner; comment out if logs should be immutable
DO $$ BEGIN
  DROP POLICY IF EXISTS emotional_labor_logs_update_own ON public.emotional_labor_logs;
  CREATE POLICY emotional_labor_logs_update_own ON public.emotional_labor_logs
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- SESSIONS (generic conversational sessions table if present)
DO $$ BEGIN
  ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS sessions_select_own ON public.sessions;
  CREATE POLICY sessions_select_own ON public.sessions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS sessions_insert_own ON public.sessions;
  CREATE POLICY sessions_insert_own ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS sessions_update_own ON public.sessions;
  CREATE POLICY sessions_update_own ON public.sessions FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;
