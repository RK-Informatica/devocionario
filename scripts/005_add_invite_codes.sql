-- Create invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_uses INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Only users can view codes they created or if they have admin privileges
CREATE POLICY "invite_codes_select" ON public.invite_codes FOR SELECT USING (
  created_by = auth.uid()
);

-- Only the creator can insert new codes
CREATE POLICY "invite_codes_insert" ON public.invite_codes FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

-- Only the creator can update their codes
CREATE POLICY "invite_codes_update" ON public.invite_codes FOR UPDATE USING (
  created_by = auth.uid()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS invite_codes_code_idx ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS invite_codes_created_by_idx ON public.invite_codes(created_by);
