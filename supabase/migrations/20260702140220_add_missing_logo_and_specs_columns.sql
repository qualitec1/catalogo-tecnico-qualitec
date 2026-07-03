-- Migration to add missing logo and specs value styling columns to pdf_settings
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS logo_width text DEFAULT '240px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS logo_height text DEFAULT '75px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS logo_position_x text DEFAULT '60px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS logo_position_y text DEFAULT '60px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS landscape_settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS specs_val_bold boolean DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS specs_val_italic boolean DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS specs_val_underline boolean DEFAULT false;
