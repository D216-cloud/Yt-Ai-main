-- Migration: Enable RLS on user_challenges table
-- This ensures users can only read/write their own challenge data

-- Enable RLS
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own challenges
CREATE POLICY "user_can_read_own_challenges" 
ON public.user_challenges FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own challenges
CREATE POLICY "user_can_insert_own_challenges" 
ON public.user_challenges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own challenges
CREATE POLICY "user_can_update_own_challenges" 
ON public.user_challenges FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own challenges
CREATE POLICY "user_can_delete_own_challenges" 
ON public.user_challenges FOR DELETE 
USING (auth.uid() = user_id);

-- Make sure user_id column has the right constraints
ALTER TABLE public.user_challenges 
ALTER COLUMN user_id SET NOT NULL;

-- Done
