-- Migration to add missing specs_bg_color column to pdf_settings
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS specs_bg_color text DEFAULT '#f3f4f6';
