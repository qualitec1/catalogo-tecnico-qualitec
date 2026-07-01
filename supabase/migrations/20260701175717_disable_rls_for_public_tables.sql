-- Disable RLS for public tables so they can be managed anonymously from the secret admin panel
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates DISABLE ROW LEVEL SECURITY;
