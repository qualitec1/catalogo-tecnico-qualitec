-- Migration to add missing title_color column to pdf_settings
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS title_color text DEFAULT NULL;
