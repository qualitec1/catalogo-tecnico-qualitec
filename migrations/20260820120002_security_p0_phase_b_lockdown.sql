-- ============================================================================
-- Migration: 20260820120002_security_p0_phase_b_lockdown.sql
-- Fase: B — LOCKDOWN DEFINITIVO (EXECUTAR APÓS O DEPLOY DO NOVO CÓDIGO)
-- Objetivo: Revogar privilégios desnecessários, expurgar policies legadas,
--           bloquear acesso direto anônimo a pdf_settings/PII/arquivos,
--           garantir permissão estrita da sequence de products.id para service_role
--           e restabelecer Row Level Security estrito e atômico.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. DEFESA EM PROFUNDIDADE: REVOKE DE PERMISSÕES DIRETAS
-- ============================================================================

-- 1.1 Revogar todo privilégio de escrita das tabelas públicas de catálogo
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.category_assets FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.site_translations FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.home_news_cards FROM anon, authenticated;

-- 1.2 Revogar acesso total (leitura e escrita) das tabelas privadas / administrativas
REVOKE ALL ON public.pdf_settings FROM anon, authenticated;
REVOKE ALL ON public.pdf_templates FROM anon, authenticated;
REVOKE ALL ON public.uploaded_files FROM anon, authenticated;
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;
REVOKE ALL ON public.totp_secrets FROM anon, authenticated;
REVOKE ALL ON public.profiles FROM anon;

-- 1.3 Garantir leitura pública DETERMINÍSTICA somente onde estritamente necessária
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.category_assets TO anon, authenticated;
GRANT SELECT ON public.site_translations TO anon, authenticated;
GRANT SELECT ON public.home_news_cards TO anon, authenticated;

-- 1.4 Garantir privilégios em profiles para usuários autenticados
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, phone, bio, updated_at) ON public.profiles TO authenticated;

-- 1.5 Conceder privilégios estritos para a service_role do servidor nas tabelas do escopo
GRANT ALL ON TABLE
    public.products,
    public.category_assets,
    public.pdf_settings,
    public.pdf_templates,
    public.site_translations,
    public.home_news_cards,
    public.uploaded_files,
    public.contact_submissions,
    public.newsletter_subscribers,
    public.profiles,
    public.totp_secrets
TO service_role;

-- 1.6 Conceder permissão estrita na sequence de products.id (IDENTITY / BIGSERIAL) para service_role
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := pg_get_serial_sequence('public.products', 'id');
    IF seq_name IS NOT NULL THEN
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO service_role', seq_name);
    END IF;
END $$;


-- ============================================================================
-- 2. EXPURGO DINÂMICO DE TODAS AS POLICIES LEGADAS / PERMISSIVAS
-- ============================================================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'products', 'category_assets', 'pdf_settings', 'pdf_templates',
            'site_translations', 'home_news_cards', 'uploaded_files',
            'contact_submissions', 'newsletter_subscribers', 'profiles', 'totp_secrets'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;


-- ============================================================================
-- 3. HABILITAÇÃO DE RLS E CRIAÇÃO DE POLICIES COM ROLES EXPLÍCITAS
-- ============================================================================

-- 3.1 PRODUCTS (Leitura pública; gestão exclusiva service_role)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.2 CATEGORY ASSETS (Leitura pública; gestão exclusiva service_role)
ALTER TABLE public.category_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Category Assets" ON public.category_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Category Assets" ON public.category_assets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.3 PDF SETTINGS (Leitura pública direta BLOQUEADA — consumo exclusivo via /api/public/settings)
ALTER TABLE public.pdf_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Manage Pdf Settings" ON public.pdf_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.4 PDF TEMPLATES (Gestão exclusiva service_role)
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Manage Pdf Templates" ON public.pdf_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.5 SITE TRANSLATIONS (Leitura pública; gestão exclusiva service_role)
ALTER TABLE public.site_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Site Translations" ON public.site_translations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Site Translations" ON public.site_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.6 HOME NEWS CARDS (Leitura pública; gestão exclusiva service_role)
ALTER TABLE public.home_news_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Home News Cards" ON public.home_news_cards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Home News Cards" ON public.home_news_cards FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.7 UPLOADED FILES (Gestão exclusiva service_role)
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Manage Uploaded Files" ON public.uploaded_files FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.8 PROFILES (Usuário lê e edita apenas campos não-segurança próprios; role='admin' verificado no servidor)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own non-security profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role manage profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.9 TOTP SECRETS (Gestão exclusiva service_role)
ALTER TABLE public.totp_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage totp" ON public.totp_secrets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.10 NEWSLETTER SUBSCRIBERS (Gestão exclusiva service_role via /api/send-email)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage newsletter" ON public.newsletter_subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.11 CONTACT SUBMISSIONS (Gestão exclusiva service_role via /api/send-email)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage contacts" ON public.contact_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
