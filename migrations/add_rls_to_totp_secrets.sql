-- Migration: Add RLS to totp_secrets table for security

-- Enable RLS
ALTER TABLE public.totp_secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/update their own TOTP secret
CREATE POLICY "Users can manage their own TOTP"
  ON public.totp_secrets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all (for admin operations)
CREATE POLICY "Service role can manage all TOTP"
  ON public.totp_secrets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
