-- Add public sharing fields if they don't exist
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"allowComments": false, "allowDownload": false}';

-- Create index for faster public page lookups
CREATE INDEX IF NOT EXISTS pages_is_public_idx ON public.pages(is_public, id);
CREATE INDEX IF NOT EXISTS pages_share_token_idx ON public.pages(share_token);
