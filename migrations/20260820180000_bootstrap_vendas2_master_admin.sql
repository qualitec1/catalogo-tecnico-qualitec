-- ============================================================================
-- Migration: 20260820180000_bootstrap_vendas2_master_admin.sql
-- Objetivo: Bootstrap inicial idempotente para promover exclusivamente o
--           usuário existente 'vendas2@qualitec.ind.br' a 'master_admin'.
--
-- Regras de Segurança:
-- 1. NÃO cria usuário no auth.users (o usuário já deve existir).
-- 2. NÃO define, altera ou contém senhas.
-- 3. A autorização futura da aplicação baseia-se unicamente em profiles.role
--    e profiles.is_active, nunca no e-mail como critério hardcoded.
-- 4. É 100% idempotente e segura para reexecução.
-- ============================================================================

BEGIN;

-- 1. Promover o perfil do vendas2 para master_admin ativo
UPDATE public.profiles
SET 
    role = 'master_admin',
    is_active = true,
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM auth.users WHERE LOWER(email) = 'vendas2@qualitec.ind.br'
);

-- 2. Garantir inserção caso o registro em profiles ainda não existisse
INSERT INTO public.profiles (id, full_name, role, is_active, updated_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'Vendas 2 - Qualitec'),
    'master_admin',
    true,
    NOW()
FROM auth.users
WHERE LOWER(email) = 'vendas2@qualitec.ind.br'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'master_admin',
    is_active = true,
    updated_at = NOW();

COMMIT;
