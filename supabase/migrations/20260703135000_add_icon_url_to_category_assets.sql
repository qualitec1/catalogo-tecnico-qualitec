-- Add icon_url column to category_assets for per-category header icons in PDF
ALTER TABLE category_assets ADD COLUMN IF NOT EXISTS icon_url TEXT;
