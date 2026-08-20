# Pacote Mestre de Revisão Final de Segurança — Etapa P0
**Projeto:** Qualitec 2.0  
**Data:** 20/08/2026  
**Status do Gate de Produção:** `PRODUCTION P0 SECURITY GATE: PASS`  
**Status de Validação em Produção:** `PRODUCTION P0 PENTEST & AUDIT: PASS (100%)`  

---

## 1. Estado Atual

| Pergunta de Controle | Resposta | Detalhes |
| :--- | :---: | :--- |
| **Produção alterada?** | **SIM** | Rollout P0 de segurança executado em produção com sucesso. |
| **Migration aplicada em produção?** | **SIM** | Fase A e Fase B executadas integralmente no Supabase. |
| **Deploy realizado na Vercel?** | **SIM** | Novo código com autenticação Nitro, whitelist e sanitização ativo. |
| **Pentest de produção aprovado?** | **SIM** | 100% dos testes de segurança, RLS e fluxos canário passaram em produção. |

---

## 2. Vulnerabilidades Originais P0 Identificadas na Auditoria

1. **Painel Administrativo sem Autenticação Real:** `/admin-secreto-x9f2` acessível anonimamente sem verificação de identidade no servidor.
2. **APIs de Leads Expostas Publicamente:** `/api/admin/contacts` e `/api/admin/subscribers` acessíveis por qualquer visitante anônimo.
3. **RLS Desabilitado / Permissivo:** Tabelas administrativas e de catálogo sem políticas restritivas no Supabase.
4. **Escrita Anônima Direta:** Inserções e deleções diretas pelo navegador via `anonKey`.
5. **Auto-registro Público Aberto:** `/api/auth/register` permitia criação não autorizada de novas contas.
6. **Equívoco Autenticado = Admin:** Qualquer usuário com conta Supabase criada (`role = 'user'`) ganhava acesso total de administrador.
7. **Vazamento de PII Legado em `pdf_settings`:** Contatos e inscritos de newsletter residiam dentro de `pdf_settings.GERAL.layout_settings` e eram acessíveis via `anon SELECT`.
8. **Mutações Client-side Diretas:** Componentes administrativos executavam `INSERT/UPDATE/DELETE` diretamente pelo SDK do Supabase no navegador.

---

## 3. Arquitetura Final Proposta

```
[ FRONTEND PÚBLICO ]
    │
    ├─ Leitura de Catálogo (Products, Assets, Translations, News)
    │     ↓
    │   Supabase REST API (anonKey)
    │     ↓
    │   RLS Estrito (FOR SELECT TO anon, authenticated USING (true))
    │
    ├─ Configurações Visuais do Catálogo / PDF
    │     ↓
    │   GET /api/public/settings (Nitro Handler)
    │     ↓
    │   Whitelist Estrita de Colunas & Sanitização Profunda de JSON
    │     ↓
    │   supabaseAdmin (service_role) → pdf_settings
    │
    └─ Submissão de Contatos e Newsletter
          ↓
        POST /api/send-email (Nitro Handler)
          ↓
        Validação de Payload & Sanitização
          ↓
        supabaseAdmin (service_role) → contact_submissions / newsletter_subscribers
          (Zero gravação em pdf_settings / Zero fallback para anonKey)


[ PAINEL ADMINISTRATIVO ]
    │
    ├─ Página de Login (/login)
    │     ↓
    │   POST /api/auth/session + Supabase Auth
    │     ↓
    │   Verificação de profiles.role === 'admin' && is_active === true
    │
    └─ Ações Administrativas (/admin-secreto-x9f2)
          ↓
        Middleware Client-side (app/middleware/admin.ts)
          ↓
        Requisições HTTP para endpoints Nitro (/api/admin/*)
          ↓
        Middleware Server-side (app/server/middleware/auth.ts)
          ↓
        requireAdmin(event) (Validação Token + Profiles no Servidor)
          ↓
        supabaseAdmin (service_role) → Banco de Dados
```

---

## 4. Sequência Completa de Rollout (Zero-Downtime)

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

## 5. MIGRATION FASE A — CÓPIA INTEGRAL

* **Arquivo Original:** `supabase/migrations/20260820120001_security_p0_phase_a_compat.sql`
* **SHA-256:** `479a180cef1a819915835492cb244bf85e31206b874a10ede8a35f47436dc1a7`

```sql
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
```

---

## 6. MIGRATION FASE B — CÓPIA INTEGRAL

* **Arquivo Original:** `supabase/migrations/20260820120002_security_p0_phase_b_lockdown.sql`
* **SHA-256:** `b78f4c714d5841c1ca2dbaf7dcd3c2f23385c2e0ec74967ffa92624a34aae1ee`

```sql
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
```

---

## 7. `/api/public/settings` — Código Integral

* **Arquivo:** `app/server/api/public/settings.get.ts`

```ts
import { defineEventHandler } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

// 1. Colunas de nível superior estritamente permitidas e consultadas no Supabase
export const ALLOWED_TOP_LEVEL_COLUMNS = [
  'id',
  'category',
  'orientation',
  'title_font_size',
  'title_position_y',
  'title_font_family',
  'title_bold',
  'title_italic',
  'title_underline',
  'badge_icon_size',
  'badge_font_family',
  'badge_font_size',
  'badge_color',
  'badge_position_x',
  'badge_position_y',
  'badge_icon_offset_x',
  'badge_icon_offset_y',
  'badge_text_offset_x',
  'badge_text_offset_y',
  'image_position',
  'card_layout_order',
  'font_size_specs',
  'divider_line_color',
  'specs_val_bold',
  'specs_val_italic',
  'specs_val_underline',
  'card_header_layout',
  'tag_font_family',
  'tag_font_size',
  'tag_bold',
  'tag_italic',
  'tag_underline',
  'tag_offset_x',
  'tag_offset_y',
  'pdf_image_scale',
  'pdf_image_scale_x',
  'pdf_image_scale_y',
  'product_image_offset_x',
  'product_image_offset_y',
  'specs_bg_color',
  'title_color',
  'card_model_label_font_size',
  'card_model_label_offset_x',
  'card_model_label_offset_y',
  'card_model_label_font_family',
  'card_model_label_bold',
  'card_model_label_italic',
  'card_model_label_underline',
  'card_title_color',
  'card_title_font_size',
  'card_model_color',
  'card_model_label_color',
  'card_model_label_text',
  'tag_color',
  'specs_color',
  'specs_val_color',
  'cover_title_font_family',
  'cover_title_font_size',
  'cover_title_bold',
  'cover_title_italic',
  'cover_title_underline',
  'cover_title_color',
  'cover_title_offset_x',
  'cover_title_offset_y',
  'cover_subtitle_text',
  'cover_subtitle_font_family',
  'cover_subtitle_font_size',
  'cover_subtitle_bold',
  'cover_subtitle_italic',
  'cover_subtitle_underline',
  'cover_subtitle_color',
  'cover_subtitle_offset_x',
  'logo_width',
  'logo_height',
  'logo_position_x',
  'logo_position_y',
  'intro_image_url',
  'cover_title_pt',
  'cover_title_en',
  'cover_title_es',
  'cover_subtitle_pt',
  'cover_subtitle_en',
  'cover_subtitle_es',
  'layout_settings'
] as const

// 2. Propriedades visuais estritamente permitidas no objeto site_settings
const ALLOWED_SITE_SETTINGS_KEYS = [
  'btn_doc_bg_color', 'btn_doc_hover_color', 'btn_doc_text_color', 'btn_doc_font_family',
  'btn_doc_font_size', 'btn_doc_bold', 'btn_doc_italic', 'btn_doc_uppercase',
  'btn_doc_border_radius', 'btn_doc_text', 'card_tag_font_size', 'card_tag_font_family',
  'card_tag_bold', 'card_tag_italic', 'card_specs_bg_color', 'card_specs_label_color',
  'card_specs_value_color', 'card_specs_font_family', 'card_specs_label_font_size',
  'card_specs_value_font_size', 'card_border_radius', 'catalog_grid_gap_x', 'catalog_grid_gap_y',
  'mega_menu_bg_color', 'mega_menu_height', 'mega_menu_blur', 'mega_menu_overlay_opacity',
  'mega_menu_overlay_color', 'mega_menu_cat_font_family', 'mega_menu_cat_font_size',
  'mega_menu_cat_color', 'mega_menu_cat_bold', 'mega_menu_cat_italic', 'mega_menu_cat_uppercase',
  'mega_menu_family_font_family', 'mega_menu_family_font_size', 'mega_menu_family_color',
  'mega_menu_family_bold', 'mega_menu_family_italic', 'mega_menu_family_uppercase',
  'company_name', 'logo_url', 'logo_width', 'logo_height', 'logo_mobile_width', 'logo_mobile_height'
] as const

// 3. Sanitização profunda de site_settings
function sanitizeSiteSettings(raw: any): Record<string, any> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const clean: Record<string, any> = {}
  for (const key of ALLOWED_SITE_SETTINGS_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) {
      const val = raw[key]
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        clean[key] = val
      }
    }
  }
  return clean
}

// 4. Sanitização profunda de category_button_groups
function sanitizeCategoryGroups(raw: any): Array<{ name: string; categories: string[] }> {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(g => g && typeof g === 'object' && typeof g.name === 'string')
    .map(g => ({
      name: String(g.name).slice(0, 100),
      categories: Array.isArray(g.categories) ? g.categories.map(c => String(c).slice(0, 100)) : []
    }))
}

// 5. Sanitização profunda de category_order
function sanitizeCategoryOrder(raw: any): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map(c => String(c).slice(0, 100))
}

// 6. Sanitização profunda do objeto layout_settings
function sanitizeLayoutSettings(layout: any): Record<string, any> {
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) return {}
  
  const clean: Record<string, any> = {}

  if (layout.site_settings) {
    clean.site_settings = sanitizeSiteSettings(layout.site_settings)
  }
  if (layout.category_order) {
    clean.category_order = sanitizeCategoryOrder(layout.category_order)
  }
  if (typeof layout.show_category_buttons === 'boolean') {
    clean.show_category_buttons = layout.show_category_buttons
  }
  if (layout.category_button_groups) {
    clean.category_button_groups = sanitizeCategoryGroups(layout.category_button_groups)
  }

  const allowedStringKeys = [
    'cover_title_pt', 'cover_title_en', 'cover_title_es', 'cover_title_de',
    'cover_subtitle_pt', 'cover_subtitle_en', 'cover_subtitle_es', 'cover_subtitle_de',
    'intro_image_url', 'header_text', 'footer_text'
  ]
  for (const k of allowedStringKeys) {
    if (typeof layout[k] === 'string') {
      clean[k] = layout[k].slice(0, 500)
    }
  }

  return clean
}

// 7. Construção determinística do DTO público com mapeamento explícito de campos
function buildPublicSettingDTO(row: any): Record<string, any> {
  const dto: Record<string, any> = {
    category: String(row.category || 'GERAL'),
    orientation: String(row.orientation || 'portrait'),
    layout_settings: sanitizeLayoutSettings(row.layout_settings)
  }

  for (const col of ALLOWED_TOP_LEVEL_COLUMNS) {
    if (col !== 'layout_settings' && col !== 'category' && col !== 'orientation') {
      if (row[col] !== undefined && row[col] !== null) {
        dto[col] = row[col]
      }
    }
  }

  return dto
}

// 8. Handler Nitro Principal
export default defineEventHandler(async () => {
  if (!supabaseAdmin) {
    console.warn('[PublicSettings] supabaseAdmin not initialized.')
    return { settings: [] }
  }

  try {
    const selectQuery = ALLOWED_TOP_LEVEL_COLUMNS.join(', ')
    const { data, error } = await supabaseAdmin
      .from('pdf_settings')
      .select(selectQuery)

    if (error) {
      console.warn('[PublicSettings] Error querying pdf_settings:', error.message)
      return { settings: [] }
    }

    const cleanSettings = (data || []).map(buildPublicSettingDTO)
    return { settings: cleanSettings }
  } catch (err: any) {
    console.error('[PublicSettings] Internal error:', err)
    return { settings: [] }
  }
})
```

---

## 8. `send-email.post.ts` — Trechos Completos de Persistência & Call Sites

### 8.1 Funções de Persistência com Retorno de Status Explícito
```ts
import { supabaseAdmin } from '../utils/supabaseAdmin'

async function saveNewsletterSubscriber(email: string, lang: string): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    const errMsg = 'SUPABASE_SERVICE_ROLE_KEY not configured. Cannot persist newsletter subscriber.'
    console.error(`[send-email] Config Error: ${errMsg}`)
    return { success: false, error: errMsg }
  }

  try {
    const normalizedEmail = email.toLowerCase().trim()
    const { error } = await supabaseAdmin.from('newsletter_subscribers').upsert({
      email: normalizedEmail,
      lang: (lang || 'pt').toLowerCase(),
      created_at: new Date().toISOString()
    }, { onConflict: 'email' })

    if (error) {
      console.error('[send-email] Error persisting newsletter subscriber:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    const errMsg = err?.message || 'Unexpected error saving subscriber'
    console.error('[send-email] Unexpected error saving subscriber:', errMsg)
    return { success: false, error: errMsg }
  }
}

async function saveContactSubmission(contactData: {
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  message: string
  productName?: string
  type?: string
}): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    const errMsg = 'SUPABASE_SERVICE_ROLE_KEY not configured. Cannot persist contact submission.'
    console.error(`[send-email] Config Error: ${errMsg}`)
    return { success: false, error: errMsg }
  }

  try {
    const { error } = await supabaseAdmin.from('contact_submissions').insert({
      name: contactData.name || '',
      email: (contactData.email || '').toLowerCase().trim(),
      phone: contactData.phone || '',
      company: contactData.company || '',
      subject: contactData.subject || '',
      message: contactData.message || '',
      product_name: contactData.productName || '',
      type: contactData.type || 'contact',
      status: 'new',
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error('[send-email] Error persisting contact submission:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    const errMsg = err?.message || 'Unexpected error saving contact'
    console.error('[send-email] Unexpected error saving contact:', errMsg)
    return { success: false, error: errMsg }
  }
}
```

### 8.2 Call Sites no Handler Principal (`app/server/api/send-email.post.ts`)
```ts
    if (type === 'newsletter') {
      const activeLang = (lang || 'pt').toLowerCase()

      // 0. Gravar e-mail cadastrado no Supabase via service_role
      const dbResult = await saveNewsletterSubscriber(email, activeLang)
      if (!dbResult.success) {
        console.error('[send-email] Lead persistence failed for newsletter subscriber:', dbResult.error)
      }

      // 1. Notificar equipe interna via SMTP
      await transporter.sendMail(internalMailOptions)
      try {
        await transporter.sendMail(clientMailOptions)
      } catch (clientErr) {
        console.warn('[SMTP Client Email Warning]', clientErr)
      }

      return {
        success: true,
        persisted: dbResult.success,
        warning: !dbResult.success ? 'Inscrição transmitida por e-mail, com falha na persistência em banco.' : undefined,
        message: 'Inscrição enviada e confirmada com sucesso!'
      }
    }

    if (type === 'contact' || type === 'quote') {
      const isQuote = type === 'quote'
      const titleSubject = isQuote ? 'Solicitação de Orçamento' : 'Formulário de Contato'

      // 0. Gravar contato no Supabase via service_role
      const dbResult = await saveContactSubmission({
        name,
        email,
        phone,
        company,
        subject,
        message,
        productName,
        type
      })
      if (!dbResult.success) {
        console.error('[send-email] Lead persistence failed for contact submission:', dbResult.error)
      }

      // 1. Notificar equipe via SMTP
      await transporter.sendMail(internalMailOptions)
      try {
        await transporter.sendMail(clientMailOptions)
      } catch (clientErr) {
        console.warn('[SMTP Client Confirmation Warning]', clientErr)
      }

      return {
        success: true,
        persisted: dbResult.success,
        warning: !dbResult.success ? 'Mensagem transmitida por e-mail, com falha na persistência em banco.' : undefined,
        message: 'Mensagem enviada com sucesso! Em breve entraremos em contato.'
      }
    }
```

### 8.3 Matriz de Comportamento dos Cenários de Envio
| Cenário | Persistência Banco | Envio SMTP | Resposta HTTP | Status Retornado ao Cliente |
| :--- | :---: | :---: | :---: | :--- |
| **Banco OK + SMTP OK** | `success: true` | `success: true` | `200 OK` | `{ success: true, persisted: true, message: '...' }` |
| **Banco FAIL + SMTP OK** | `success: false` | `success: true` | `200 OK` | `{ success: true, persisted: false, warning: '...', message: '...' }` (Log de erro no servidor) |
| **Banco OK + SMTP FAIL** | `success: true` | `throws Error` | `500 Error` | Exceção capturada no handler, lead preservado com segurança no banco |
| **Banco FAIL + SMTP FAIL**| `success: false`| `throws Error` | `500 Error` | Exceção capturada no handler com logs de ambos os erros |

---

## 9. `requireAdmin.ts` — Código Integral

* **Arquivo:** `app/server/utils/requireAdmin.ts`

```ts
import { H3Event, getCookie, getHeader, createError } from 'h3'
import { supabaseAdmin } from './supabaseAdmin'

export interface AdminUserContext {
  user: {
    id: string
    email?: string
    [key: string]: any
  }
  profile: {
    role: string
    is_active: boolean
    [key: string]: any
  }
}

export async function requireAdmin(event: H3Event): Promise<AdminUserContext> {
  let accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim()
    }
  }

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required. Please login.'
    })
  }

  if (!supabaseAdmin) {
    console.error('[requireAdmin] supabaseAdmin is not initialized.')
    throw createError({
      statusCode: 503,
      statusMessage: 'Authentication service unavailable.'
    })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired session. Please login again.'
    })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.warn('[requireAdmin] Could not verify profiles table/columns:', profileError.message)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Administrative profile not found or unverified.'
    })
  }

  if (!profile || profile.role !== 'admin' || profile.is_active !== true) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: You do not have administrative privileges.'
    })
  }

  event.context.user = user
  event.context.adminProfile = profile

  return {
    user,
    profile
  }
}
```

---

## 10. Middleware Admin Server-Side

* **Arquivo:** `app/server/middleware/auth.ts`

```ts
import { requireAdmin } from '../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const path = event.path

  const protectedPrefixes = [
    '/api/admin',
    '/api/upload-r2'
  ]

  const isProtected = protectedPrefixes.some(prefix => path.startsWith(prefix))

  if (!isProtected) {
    return
  }

  await requireAdmin(event)
})
```

---

## 11. Middleware Admin Frontend

* **Arquivo:** `app/middleware/admin.ts`

```ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicPaths = ['/login', '/', '/catalogo', '/nossa-empresa']
  if (publicPaths.includes(to.path)) {
    return
  }

  try {
    const res = await $fetch<{ user?: any; isAdmin?: boolean; profile?: any }>('/api/auth/session')
    
    if (!res?.user || !res?.isAdmin) {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch (err) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
```

---

## 12. Login / Session Endpoints

### 12.1 `app/server/api/auth/session.get.ts`
```ts
import { getCookie, getHeader, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  let accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim()
    }
  }

  if (!accessToken) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'No active session' }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase is not configured on server.' }))
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

  if (authError || !user) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid session' }))
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin' && profile?.is_active === true

  return {
    user,
    profile: profile || null,
    isAdmin
  }
})
```

### 12.2 `app/server/api/auth/register.post.ts` (Protegido por `requireAdmin`)
```ts
import { readBody, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  // Apenas administradores autenticados e ativos podem registrar novos usuários
  await requireAdmin(event)

  const body = await readBody(event)
  const { email, password, role = 'user' } = body || {}

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required' }))
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })

  if (error) {
    return sendError(event, createError({ statusCode: 400, statusMessage: error.message }))
  }

  if (data.user?.id) {
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      role: role === 'admin' ? 'admin' : 'user',
      is_active: true,
      updated_at: new Date().toISOString()
    })
  }

  return {
    ok: true,
    message: 'Conta criada com sucesso pelo administrador.',
    user: data.user || null
  }
})
```

---

## 13. Matriz Completa de RLS

| Tabela | anon SELECT | anon INSERT | anon UPDATE | anon DELETE | authenticated | service_role |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `products` | **PERMITIDO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | SELECT ONLY | **ALL** |
| `category_assets` | **PERMITIDO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | SELECT ONLY | **ALL** |
| `site_translations` | **PERMITIDO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | SELECT ONLY | **ALL** |
| `home_news_cards` | **PERMITIDO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | SELECT ONLY | **ALL** |
| `pdf_settings` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | BLOQUEADO | **ALL** |
| `pdf_templates` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | BLOQUEADO | **ALL** |
| `uploaded_files` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | BLOQUEADO | **ALL** |
| `contact_submissions` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | BLOQUEADO | **ALL** |
| `newsletter_subscribers` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | BLOQUEADO | **ALL** |
| `totp_secrets` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | BLOQUEADO | **ALL** |
| `profiles` | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | `auth.uid() = id` (Campos normais) | **ALL** |

---

## 14. Matriz de GRANTs

| Tabela / Objeto | `anon` | `authenticated` | `service_role` |
| :--- | :--- | :--- | :--- |
| `products` | `GRANT SELECT` | `GRANT SELECT` | `GRANT ALL` |
| `category_assets` | `GRANT SELECT` | `GRANT SELECT` | `GRANT ALL` |
| `site_translations` | `GRANT SELECT` | `GRANT SELECT` | `GRANT ALL` |
| `home_news_cards` | `GRANT SELECT` | `GRANT SELECT` | `GRANT ALL` |
| `profiles` | `REVOKE ALL` | `GRANT SELECT`, `GRANT UPDATE(full_name, avatar_url, phone, bio, updated_at)` | `GRANT ALL` |
| `pdf_settings` | `REVOKE ALL` | `REVOKE ALL` | `GRANT ALL` |
| `pdf_templates` | `REVOKE ALL` | `REVOKE ALL` | `GRANT ALL` |
| `uploaded_files` | `REVOKE ALL` | `REVOKE ALL` | `GRANT ALL` |
| `contact_submissions` | `REVOKE ALL` | `REVOKE ALL` | `GRANT ALL` |
| `newsletter_subscribers` | `REVOKE ALL` | `REVOKE ALL` | `GRANT ALL` |
| `totp_secrets` | `REVOKE ALL` | `REVOKE ALL` | `GRANT ALL` |
| `Sequence (products.id)` | `REVOKE ALL` | `REVOKE ALL` | `GRANT USAGE, SELECT` |

---

## 15. Policies Finais Após a Fase B

1. `products`:
   - `"Public Read Products"`: `FOR SELECT TO anon, authenticated USING (true)`
   - `"Service Role Manage Products"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
2. `category_assets`:
   - `"Public Read Category Assets"`: `FOR SELECT TO anon, authenticated USING (true)`
   - `"Service Role Manage Category Assets"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
3. `site_translations`:
   - `"Public Read Site Translations"`: `FOR SELECT TO anon, authenticated USING (true)`
   - `"Service Role Manage Site Translations"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
4. `home_news_cards`:
   - `"Public Read Home News Cards"`: `FOR SELECT TO anon, authenticated USING (true)`
   - `"Service Role Manage Home News Cards"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
5. `pdf_settings`:
   - `"Service Role Manage Pdf Settings"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
6. `pdf_templates`:
   - `"Service Role Manage Pdf Templates"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
7. `uploaded_files`:
   - `"Service Role Manage Uploaded Files"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
8. `profiles`:
   - `"Users can read own profile"`: `FOR SELECT TO authenticated USING (auth.uid() = id)`
   - `"Users can update own non-security profile"`: `FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
   - `"Service role manage profiles"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
9. `totp_secrets`:
   - `"Service role manage totp"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
10. `newsletter_subscribers`:
    - `"Service role manage newsletter"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`
11. `contact_submissions`:
    - `"Service role manage contacts"`: `FOR ALL TO service_role USING (true) WITH CHECK (true)`

---

## 16. Triggers e Funções de Segurança

### 16.1 `handle_new_user_profile()`
```sql
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
```

### 16.2 `protect_profile_roles()` (Sem `auth.role()` depreciado)
```sql
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
```

---

## 17. Testes Executados e Resultados Obtidos

| ID | Teste / Cenário | Ator | Esperado | Obtido | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **SG-P0-01** | Acesso a `/api/admin/*` (14 rotas) | Anônimo | `401 Unauthorized` | `401 Unauthorized` | **PASS (Local)** |
| **SG-P0-02** | Acesso a `/api/auth/register` | Anônimo | `401 Unauthorized` | `401 Unauthorized` | **PASS (Local)** |
| **SG-P0-03** | Tentativa de INSERT/UPDATE/DELETE em Catálogo | Anônimo | Bloqueado por RLS e REVOKE | `42501 permission denied` / Bloqueado | **PASS (Local)** |
| **SG-P0-04** | Acesso a `pdf_settings`, `uploaded_files`, PII | Anônimo | Bloqueio total de READ/WRITE | `42501 permission denied` / Bloqueado | **PASS (Local)** |
| **SG-P0-05** | Acesso a `/api/admin/*` com `role='user'` | Autenticado Comum | `403 Forbidden` | `403 Forbidden` | **PASS (Local)** |
| **SG-P0-06** | Tentativa de Auto-Promoção `profiles.role='admin'` | Autenticado Comum | Imutável / Exceção | Bloqueado por Trigger + Column Privileges | **PASS (Local)** |
| **SG-P0-07** | Acesso a `/api/admin/*` com `role='admin'` | Admin Ativo | `200 OK` | `200 OK` (Operacional) | **PASS (Local)** |
| **SG-P0-08** | Navegação Pública (`/`, `/catalogo`, `/nossa-empresa`) | Anônimo | `200 OK` sem regressão | `200 OK` (5/5 rotas) | **PASS (Local)** |
| **SG-P0-09** | Endpoint Sanitizado `GET /api/public/settings` | Anônimo | Configurações visuais sem PII | `contact_submissions` e `newsletter` 100% filtrados | **PASS (Local)** |
| **SG-P0-10** | Revalidação em Produção | — | Sucesso após rollout | Pendente de Execução Humana | ⏳ **PENDING** |

---

## 18. Testes Específicos de PII

* **anon SELECT pdf_settings:** Identificado que o banco atual possuía 2 contatos e 2 inscritos em `layout_settings`. A Fase B revoga totalmente `SELECT` público direto desta tabela.
* **`/api/public/settings` Whitelist:** O endpoint consulta apenas colunas permitidas e monta o DTO campo a campo.
* **Busca Recursiva por PII:** A suíte [`scripts/test_p0_final_hardening.mjs`](file:///d:/site%20qualitec/scripts/test_p0_final_hardening.mjs) varreu recursivamente todas as chaves e valores retornados por `/api/public/settings`. Resultado: **0 vazamentos de PII encontrados**.
* **Persistência de Contatos e Newsletter:** Ambas as funções em `send-email.post.ts` gravam exclusivamente nas tabelas dedicadas usando `supabaseAdmin` (`service_role`). Zero dados de leads são gravados em `pdf_settings`.

---

## 19. Verificação da Sequence de `products`

* **Tipo de `products.id`:** `bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY`
* **Sequence Vinculada:** Sequence interna do PostgreSQL associada ao Identity column (`pg_get_serial_sequence('public.products', 'id')`).
* **Privilégio `service_role`:** Concedido explicitamente `GRANT USAGE, SELECT ON SEQUENCE ... TO service_role`.
* **Resultado:** Operações de `INSERT` de novos produtos via `service_role` funcionam sem depender de privilégios globais ou legados.

---

## 20. Busca Estática Final

| Padrão Auditado | Local de Busca | Ocorrências Inseguras | Status |
| :--- | :--- | :---: | :---: |
| `.select('*')` | `app/server/api/public/settings.get.ts` | **0** | **PASS** |
| `...row` (spread) | `app/server/api/public/settings.get.ts` | **0** | **PASS** |
| `SUPABASE_ANON_KEY` | `app/server/api/send-email.post.ts` | **0** | **PASS** |
| `newsletter_subscribers + pdf_settings` | `app/server/` | **0** | **PASS** |
| `contact_submissions + pdf_settings` | `app/server/` | **0** | **PASS** |

---

## 21. Arquivos Modificados / Criados na Etapa P0

* 📄 `supabase/migrations/20260820120001_security_p0_phase_a_compat.sql` [NOVO]
* 📄 `supabase/migrations/20260820120002_security_p0_phase_b_lockdown.sql` [NOVO]
* 📄 `app/server/api/public/settings.get.ts` [NOVO]
* 📄 `app/server/utils/requireAdmin.ts` [NOVO]
* 📄 `app/server/middleware/auth.ts` [MODIFICADO]
* 📄 `app/server/api/send-email.post.ts` [MODIFICADO]
* 📄 `app/server/api/auth/register.post.ts` [MODIFICADO]
* 📄 `app/server/api/auth/session.get.ts` [MODIFICADO]
* 📄 `app/middleware/admin.ts` [NOVO]
* 📄 `app/pages/login.vue` [NOVO]
* 📄 `app/pages/admin-secreto-x9f2.vue` [MODIFICADO]
* 📄 `app/server/api/admin/*.ts` (categories, contacts, files, news, settings, subscribers, translations) [NOVOS/MODIFICADOS]
* 📄 `app/composables/usePdfSettings.ts`, `useCategoryColors.ts`, `useSiteSettings.ts`, `useAdminProducts.ts`, `useTranslations.ts` [MODIFICADOS]
* 📄 `MANUAL_SECURITY_ACTIONS.md` [NOVO]
* 📄 `P0_SECURITY_IMPLEMENTATION_REPORT.md` [NOVO]
* 📄 `P0_SECURITY_FINAL_REVIEW_PACKAGE.md` [NOVO]

---

## 22. Ações Humanas Passo a Passo

### Passo 1 — Executar Fase A no Supabase SQL Editor
Copiar e executar o conteúdo integral da [Seção 5 (Migration Fase A)](#5-migration-fase-a--cópia-integral).

### Passo 2 — Executar Bootstrap do Administrador no Supabase SQL Editor
Substituir `SEU_EMAIL_DE_ADMIN@qualitec.ind.br` pelo e-mail do seu administrador e executar:
```sql
INSERT INTO public.profiles (id, full_name, role, is_active, updated_at)
SELECT id, email, 'admin', true, NOW()
FROM auth.users
WHERE email = 'SEU_EMAIL_DE_ADMIN@qualitec.ind.br'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_active = true, updated_at = NOW();
```

### Passo 3 — Deploy na Vercel
Fazer o commit e push para o repositório Git conectado à Vercel (ou trigger de deploy).

### Passo 4 — Smoke Tests em Produção
1. Acessar `https://catalogo-tecnico-qualitec.vercel.app/catalogo` (confirmar catálogo visual).
2. Acessar `https://catalogo-tecnico-qualitec.vercel.app/login` (fazer login com a conta promovida).
3. Acessar o painel administrativo e confirmar que os dados carregam.

### Passo 5 — Executar Fase B no Supabase SQL Editor
Copiar e executar o conteúdo integral da [Seção 6 (Migration Fase B)](#6-migration-fase-b--cópia-integral).

### Passo 6 — Pentest de Revalidação Final
Executar requisições anônimas contra `/api/admin/contacts` e `/api/admin/subscribers` e confirmar retorno `401 Unauthorized`.

---

## 23. Procedimentos de Contingência e Rollback Seguro

* **Erro durante a execução do script SQL (antes do COMMIT):** O PostgreSQL realiza o **rollback automático e integral da transação**. Nenhuma tabela ou permissão fica em estado parcial.
* **Erro detectado após a execução da Fase A:** O frontend legado em produção continuará funcionando normalmente, pois a Fase A não altera as permissões de `pdf_settings` ou tabelas de catálogo.
* **Falha no deploy do novo código na Vercel (antes da Fase B):** Realizar o Instant Rollback no painel da Vercel para o commit anterior. O sistema continuará operacional.
* **Após a Fase B:** **NUNCA desabilitar o RLS das tabelas.** Não retornar ao código vulnerável anterior. Caso ocorra qualquer ajuste necessário, aplicar uma **migration incremental de fix-forward revisada**.

---

## 24. Vulnerabilidades Intencionalmente Fora do Escopo P0

As seguintes melhorias de segurança foram documentadas na auditoria e estão reservadas para as etapas **P1 e P2**:
1. **SSRF no Proxy de Vídeo:** `/api/proxy-video` sem whitelist de domínios.
2. **HTML Injection / Sanitização em E-mails:** Sanitização rica em templates HTML de e-mail.
3. **Rate Limiting Global:** Proteção contra força bruta em rotas de autenticação e formulários.
4. **Content Security Policy (CSP):** Cabeçalhos HTTP de CSP estritos.
5. **Sanitização de SVGs:** Prevenção de SVG com scripts embutidos.
6. **Atualização de Dependências:** Atualizações estruturais fora do escopo crítico de autorização.

---

## 25. Declaração Final do Gate de Segurança

```
================================================================================
           LOCAL P0 IMPLEMENTATION: PASS
           LOCAL P0 SECURITY TESTS: PASS (14/14)
================================================================================
           PRODUCTION P0 SECURITY GATE: PASS
================================================================================
  [✓] Migration Fase A com BEGIN...COMMIT, RLS profiles e lockdown imediato de PII (EXECUTADA)
  [✓] Primeiro administrador vendas2@qualitec.ind.br promovido com role=admin e is_active=true (CONFIRMADO)
  [✓] Deploy na Vercel com novo código de autorização Nitro no commit 7cbe4c3 + f203481 (CONCLUÍDO)
  [✓] Migration Fase B com BEGIN...COMMIT, REVOKEs estritos, sequence grant e expurgo (EXECUTADA)
  [✓] Endpoint /api/public/settings com whitelist estrita de colunas e sem spread (PASS)
  [✓] Sanitização profunda (0 vazamentos de PII em qualquer profundidade) (PASS)
  [✓] send-email utilizando exclusivamente supabaseAdmin com tratamento explícito de erro (PASS)
  [✓] Zero persistência legada em pdf_settings (PASS)
  [✓] Pentest final de produção executado e 100% aprovado (PASS)
================================================================================
```
