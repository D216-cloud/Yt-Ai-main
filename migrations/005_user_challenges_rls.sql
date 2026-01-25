-- Enable Row Level Security and create an owner-only policy for user_challenges
-- Run this AFTER running previous migrations and ensure auth.uid() is set up (Supabase Auth)

-- Only apply RLS and policy if the table exists to avoid errors when migrations run out-of-order
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_challenges') THEN
    ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

    -- Policy: only the user (auth.uid()) may SELECT/INSERT/UPDATE/DELETE their rows
    -- Drop any existing policy first (CREATE POLICY doesn't support IF NOT EXISTS)
    DROP POLICY IF EXISTS user_can_manage_own_challenge ON public.user_challenges;

    CREATE POLICY user_can_manage_own_challenge ON public.user_challenges
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Note: On Supabase you may need to run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` from SQL editor
-- and ensure the function `auth.uid()` is available (Supabase managed DB provides it).