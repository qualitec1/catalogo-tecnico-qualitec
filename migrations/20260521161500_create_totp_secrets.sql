-- Migration: create TOTP secrets storage for 2FA

CREATE TABLE IF NOT EXISTS public.totp_secrets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  secret text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_totp_secrets_user_id ON public.totp_secrets (user_id);
