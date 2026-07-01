-- Add pdf_url column to category_assets for storing pre-rendered static PDFs
ALTER TABLE public.category_assets ADD COLUMN IF NOT EXISTS pdf_url text;
