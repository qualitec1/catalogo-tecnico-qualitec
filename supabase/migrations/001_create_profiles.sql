-- Migration: create profiles table and enable RLS

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: owner can select/insert/update/delete only their own profile
CREATE POLICY "Profiles: owner can manage" ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
