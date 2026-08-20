-- ============================================================================
-- Migration: 20260820120001_security_p0_phase_a_compat.sql
-- Fase: A — COMPATIBILIDADE, INFRAESTRUTURA E PROTEÇÃO DE PROFILES & PII
-- Objetivo: Criar schema de perfis, colunas administrativas, triggers de proteção,
--           habilitar RLS em profiles com restrição auth.uid() = id e column privileges,
--           garantir tabelas de contatos/newsletter com lockdown imediato de PII (RLS + REVOKE)
--           e permitir que o primeiro admin seja promovido ANTES do deploy do novo código,
--           SEM quebrar o frontend legado que ainda roda em produção.
-- ============================================================================

BEGIN;

-- 1. MODELO DE AUTORIZAÇÃO ADMINISTRATIVA (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir existência das colunas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON public.profiles(role, is_active);

-- 2. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO (DEFAULT 'user')
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'user', -- Por padrão, novos usuários nunca nascem como admin
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. TRIGGER DE PROTEÇÃO CONTRA ESCALAÇÃO DE PRIVILÉGIOS (SEM auth.role())
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER AS $$
DECLARE
    jwt_role TEXT;
BEGIN
    -- Extração segura do claim 'role' do JWT Supabase sem funções depreciadas
    jwt_role := COALESCE(
        current_setting('request.jwt.claim.role', true),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
        ''
    );

    -- Se a chamada partir de cliente web autenticado ou anônimo, proíbe alterar role ou is_active
    IF (jwt_role IN ('anon', 'authenticated')) THEN
        IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
            RAISE EXCEPTION 'Acesso Negado: Usuários normais não possuem permissão para alterar role ou is_active.';
        END IF;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- 4. PRIVILÉGIOS DE TABELA E COLUNA EM PROFILES
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Usuários autenticados podem apenas ler e atualizar campos não-sensíveis
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, phone, bio, updated_at) ON public.profiles TO authenticated;

-- Service Role tem controle total
GRANT ALL ON public.profiles TO service_role;

-- 5. HABILITAÇÃO IMEDIATA DE RLS EM PROFILES NA FASE A
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own non-security profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role manage profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own non-security profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role manage profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. GARANTIR TABELAS DEDICADAS DE CONTATOS E NEWSLETTER
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    product_name TEXT,
    type VARCHAR(50) DEFAULT 'contact',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    lang VARCHAR(10) DEFAULT 'pt',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LOCKDOWN IMEDIATO DE PII (CONTATOS E NEWSLETTER) NA FASE A
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;

GRANT ALL ON public.contact_submissions TO service_role;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('contact_submissions', 'newsletter_subscribers')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

CREATE POLICY "Service role manage contacts"
    ON public.contact_submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role manage newsletter"
    ON public.newsletter_subscribers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMIT;
