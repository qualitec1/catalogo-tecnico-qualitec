ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model3d_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
