-- Migration: 20260805_create_newsletter_and_contacts_tables.sql
-- Descrição: Criação de tabelas dedicadas para Newsletter e Contatos do Chat/Site.

-- ================================================================
-- 1. TABELA DE NEWSLETTER
-- ================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    lang VARCHAR(10) NOT NULL DEFAULT 'pt',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
);

-- Índice para acelerar busca por e-mail e ordenação por data
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON public.newsletter_subscribers (created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Permite inserção anônima/pública (visitantes do site)
CREATE POLICY "Permitir insercao publica na newsletter"
    ON public.newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

-- Policy: Permite leitura e exclusão para a chave de serviço e usuários autenticados
CREATE POLICY "Permitir leitura para autenticados e service_role"
    ON public.newsletter_subscribers
    FOR SELECT
    USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Permitir exclusao para autenticados e service_role"
    ON public.newsletter_subscribers
    FOR DELETE
    USING (auth.role() IN ('authenticated', 'service_role'));


-- ================================================================
-- 2. TABELA DE CONTATOS DO CHAT E FORMULÁRIOS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    product_name TEXT,
    type VARCHAR(30) NOT NULL DEFAULT 'contact', -- 'contact', 'quote', 'chat'
    status VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new', 'read', 'archived'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para relatórios e busca por e-mail e data
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Permite inserção anônima/pública (formulários do site)
CREATE POLICY "Permitir insercao publica em contatos"
    ON public.contact_submissions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Permite leitura para autenticados e service_role
CREATE POLICY "Permitir leitura de contatos para autenticados e service_role"
    ON public.contact_submissions
    FOR SELECT
    USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Permitir atualizacao e exclusao de contatos para autenticados e service_role"
    ON public.contact_submissions
    FOR ALL
    USING (auth.role() IN ('authenticated', 'service_role'));


-- ================================================================
-- 3. SCRIPT DE MIGRAÇÃO/BACKFILL DOS DADOS EXISTENTES
-- ================================================================
-- Copia os e-mails antigos do JSON da pdf_settings para a nova tabela
DO $$
DECLARE
    sub_record RECORD;
    sub_json JSONB;
BEGIN
    SELECT layout_settings->'newsletter_subscribers' INTO sub_json
    FROM public.pdf_settings
    WHERE category = 'GERAL'
    LIMIT 1;

    IF sub_json IS NOT NULL AND jsonb_array_length(sub_json) > 0 THEN
        FOR sub_record IN SELECT * FROM jsonb_to_recordset(sub_json) AS x(email text, lang text, subscribed_at timestamptz)
        LOOP
            INSERT INTO public.newsletter_subscribers (email, lang, created_at)
            VALUES (
                LOWER(TRIM(sub_record.email)),
                COALESCE(sub_record.lang, 'pt'),
                COALESCE(sub_record.subscribed_at, NOW())
            )
            ON CONFLICT (email) DO NOTHING;
        END LOOP;
    END IF;
END $$;
