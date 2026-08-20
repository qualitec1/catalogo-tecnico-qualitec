# Ações Humanas Obrigatórias de Segurança (Manual Security Actions)
**Projeto:** Qualitec 2.0  
**Data:** 20/08/2026  
**Status do Gate de Produção:** `PRODUCTION P0 SECURITY GATE: BLOCKED — AWAITING FINAL REVIEW`  

---

## ⚠️ Plano de Implantação em Duas Fases (Zero-Downtime)

Para evitar incompatibilidade operacional (o código antigo em produção lê `pdf_settings` diretamente, enquanto o novo código consome `/api/public/settings`), a implantação deve seguir rigorosamente a sequência de duas fases:

```
[ PASSO 1 ] Executar FASE A no Supabase SQL Editor (Estrutura, Profiles & Lockdown de PII)
    ↓
[ PASSO 2 ] Executar Bootstrap do Primeiro Administrador no Supabase SQL Editor
    ↓
[ PASSO 3 ] Deploy do Novo Código na Vercel (Código com /api/public/settings e middleware)
    ↓
[ PASSO 4 ] Smoke Tests em Produção (Validar catálogo público e login administrativo)
    ↓
[ PASSO 5 ] Executar FASE B no Supabase SQL Editor (Lockdown Definitivo de Catálogo e RLS)
    ↓
[ PASSO 6 ] Pentest de Revalidação Final em Produção
```

---

## FASE A — Compatibilidade, Infraestrutura & Proteção de Profiles e PII (Executar ANTES do Deploy)

### Script SQL para Executar no SQL Editor do Supabase
* **Arquivo:** [`supabase/migrations/20260820120001_security_p0_phase_a_compat.sql`](file:///d:/site%20qualitec/supabase/migrations/20260820120001_security_p0_phase_a_compat.sql)
* **SHA-256:** `479a180cef1a819915835492cb244bf85e31206b874a10ede8a35f47436dc1a7`

```sql
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
        'user',
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
    jwt_role := COALESCE(
        current_setting('request.jwt.claim.role', true),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
        ''
    );

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

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, phone, bio, updated_at) ON public.profiles TO authenticated;
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
```

---

## BOOTSTRAP — Promover Primeiro Administrador

No **SQL Editor** do Supabase, substitua `SEU_EMAIL_DE_ADMIN@qualitec.ind.br` pelo e-mail do seu usuário e execute:

```sql
INSERT INTO public.profiles (id, full_name, role, is_active, updated_at)
SELECT 
    id, 
    email, 
    'admin', 
    true, 
    NOW()
FROM auth.users
WHERE email = 'SEU_EMAIL_DE_ADMIN@qualitec.ind.br'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    is_active = true,
    updated_at = NOW();

SELECT id, full_name, role, is_active, updated_at
FROM public.profiles
WHERE role = 'admin';
```

---

## FASE B — Lockdown Definitivo (Executar APÓS o Deploy do Novo Código)

### Script SQL para Executar no SQL Editor do Supabase
* **Arquivo:** [`supabase/migrations/20260820120002_security_p0_phase_b_lockdown.sql`](file:///d:/site%20qualitec/supabase/migrations/20260820120002_security_p0_phase_b_lockdown.sql)
* **SHA-256:** `b78f4c714d5841c1ca2dbaf7dcd3c2f23385c2e0ec74967ffa92624a34aae1ee`

```sql
BEGIN;

-- 1. DEFESA EM PROFUNDIDADE: REVOKE DE PERMISSÕES DIRETAS
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.category_assets FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.site_translations FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.home_news_cards FROM anon, authenticated;

REVOKE ALL ON public.pdf_settings FROM anon, authenticated;
REVOKE ALL ON public.pdf_templates FROM anon, authenticated;
REVOKE ALL ON public.uploaded_files FROM anon, authenticated;
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;
REVOKE ALL ON public.totp_secrets FROM anon, authenticated;
REVOKE ALL ON public.profiles FROM anon;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.category_assets TO anon, authenticated;
GRANT SELECT ON public.site_translations TO anon, authenticated;
GRANT SELECT ON public.home_news_cards TO anon, authenticated;

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, phone, bio, updated_at) ON public.profiles TO authenticated;

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

DO $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := pg_get_serial_sequence('public.products', 'id');
    IF seq_name IS NOT NULL THEN
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO service_role', seq_name);
    END IF;
END $$;

-- 2. EXPURGO DINÂMICO DE TODAS AS POLICIES LEGADAS
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

-- 3. HABILITAÇÃO DE RLS E CRIAÇÃO DE POLICIES COM ROLES EXPLÍCITAS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.category_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Category Assets" ON public.category_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Category Assets" ON public.category_assets FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.pdf_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Manage Pdf Settings" ON public.pdf_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Manage Pdf Templates" ON public.pdf_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.site_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Site Translations" ON public.site_translations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Site Translations" ON public.site_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.home_news_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Home News Cards" ON public.home_news_cards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service Role Manage Home News Cards" ON public.home_news_cards FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Manage Uploaded Files" ON public.uploaded_files FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own non-security profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role manage profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.totp_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage totp" ON public.totp_secrets FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage newsletter" ON public.newsletter_subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage contacts" ON public.contact_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
```

---

## Procedimentos de Contingência e Rollback Seguro

* **Erro durante a execução do script SQL (antes do COMMIT):** O PostgreSQL realiza o **rollback automático e integral da transação**. Nenhuma tabela ou permissão fica em estado parcial.
* **Erro detectado após a execução da Fase A:** O frontend legado em produção continuará funcionando normalmente, pois a Fase A não altera as permissões de `pdf_settings` ou tabelas de catálogo.
* **Falha no deploy do novo código na Vercel (antes da Fase B):** Realizar o Instant Rollback no painel da Vercel para o commit anterior. O sistema continuará operacional.
* **Após a Fase B:** **NUNCA desabilitar o RLS das tabelas.** Não retornar ao código vulnerável anterior. Caso ocorra qualquer ajuste necessário, aplicar uma **migration incremental de fix-forward revisada**.
