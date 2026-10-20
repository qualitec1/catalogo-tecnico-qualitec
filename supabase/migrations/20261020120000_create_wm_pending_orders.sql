-- ============================================================================
-- Migration: 20261020120000_create_wm_pending_orders.sql
-- Objetivo: Criar o espelho (snapshot) dos pedidos pendentes do cliente
--           WHITE MARTINS extraídos do ITKSoft (db_qualitecnew), consumido pela
--           página protegida /gestao/pendencias-white-martins.
--
-- Origem da verdade: ITKSoft (MySQL db_qualitecnew). Estas tabelas são apenas
--   um espelho de leitura, recarregado pelo script gerado por
--   scripts/generate-wm-pending-sql.mjs (upsert idempotente + limpeza).
--
-- Vínculos:
--   wm_pending_orders (pai)  1 ──── N  wm_pending_order_items (filha)
--   Chave: wm_pending_order_items.order_codigo_itk → wm_pending_orders.codigo_itk
--   ON DELETE CASCADE / ON UPDATE CASCADE (item não existe sem o pedido).
--
-- Segurança: RLS habilitado; acesso exclusivo da service_role (servidor Nitro,
--   endpoint /api/admin/pedidos-white-martins protegido por requireAdmin).
--   anon e authenticated NÃO têm acesso direto.
--
-- Compatibilidade: tabelas novas, sem dependência de dados existentes.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. PEDIDOS (pai)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wm_pending_orders (
    codigo_itk           TEXT PRIMARY KEY,
    emissao              DATE NOT NULL,
    pedido_cliente       TEXT,
    cliente_codigo       TEXT NOT NULL,
    cliente_razao        TEXT NOT NULL,
    cliente_fantasia     TEXT,
    cliente_cnpj         TEXT,
    filial               TEXT NOT NULL,
    cidade               TEXT,
    estado               CHAR(2),
    regiao               TEXT NOT NULL,
    valor_total_pedido   NUMERIC(18,4) NOT NULL DEFAULT 0,
    valor_faturado       NUMERIC(18,4) NOT NULL DEFAULT 0,
    valor_pendente       NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_total_pedida     NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_total_faturada   NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_total_pendente   NUMERIC(18,4) NOT NULL DEFAULT 0,
    status_faturamento   TEXT NOT NULL,
    -- Listas curtas e somente leitura de documentos do ERP (números de documento),
    -- exibidas como referência. Não são entidades do catálogo; o detalhe completo
    -- permanece no ITKSoft. Por isso TEXT[] em vez de tabelas filhas.
    tem_romaneio         BOOLEAN NOT NULL DEFAULT FALSE,
    romaneios            TEXT[] NOT NULL DEFAULT '{}',
    tem_ord_sepa         BOOLEAN NOT NULL DEFAULT FALSE,
    ordens_separacao     TEXT[] NOT NULL DEFAULT '{}',
    tem_nf               BOOLEAN NOT NULL DEFAULT FALSE,
    nfs_emitidas         TEXT[] NOT NULL DEFAULT '{}',
    status_logistico     TEXT,
    observacao           TEXT,
    synced_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT wm_pending_orders_regiao_chk
        CHECK (regiao IN ('Sudeste', 'Nordeste', 'Centro-Oeste', 'Sul', 'Norte')),
    CONSTRAINT wm_pending_orders_status_chk
        CHECK (status_faturamento IN ('100% Pendente', 'Parcialmente Faturado', 'Pré-Nota Gerada (Em Faturamento)'))
);

CREATE INDEX IF NOT EXISTS wm_pending_orders_regiao_idx  ON public.wm_pending_orders (regiao);
CREATE INDEX IF NOT EXISTS wm_pending_orders_filial_idx  ON public.wm_pending_orders (filial);
CREATE INDEX IF NOT EXISTS wm_pending_orders_status_idx  ON public.wm_pending_orders (status_faturamento);
CREATE INDEX IF NOT EXISTS wm_pending_orders_emissao_idx ON public.wm_pending_orders (emissao);

-- ----------------------------------------------------------------------------
-- 2. ITENS DO PEDIDO (filha)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wm_pending_order_items (
    order_codigo_itk  TEXT NOT NULL
        REFERENCES public.wm_pending_orders (codigo_itk)
        ON DELETE CASCADE ON UPDATE CASCADE,
    seq               TEXT NOT NULL,
    cod_produto       TEXT NOT NULL,
    descricao         TEXT NOT NULL,
    part_number       TEXT,
    unidade           TEXT,
    origem            TEXT NOT NULL,
    origem_codigo     SMALLINT,
    quantidade        NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_fatura        NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_libera        NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_cancel        NUMERIC(18,4) NOT NULL DEFAULT 0,
    qtd_pendente      NUMERIC(18,4) NOT NULL DEFAULT 0,
    unitario          NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_item        NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_faturado    NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_pendente    NUMERIC(18,4) NOT NULL DEFAULT 0,
    notafiscal        TEXT,
    datafatura        DATE,
    pre_nota          TEXT,
    ped_cli           TEXT,
    it_ped_cli        TEXT,
    synced_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (order_codigo_itk, seq),
    CONSTRAINT wm_pending_order_items_origem_chk
        CHECK (origem IN ('Importado', 'Nacional'))
);

-- Ranking "itens mais caros" (somente itens com saldo pendente)
CREATE INDEX IF NOT EXISTS wm_pending_order_items_pendente_idx
    ON public.wm_pending_order_items (total_pendente DESC)
    WHERE qtd_pendente > 0;

-- ----------------------------------------------------------------------------
-- 3. SEGURANÇA: RLS + privilégios (padrão do lockdown P0)
-- ----------------------------------------------------------------------------
REVOKE ALL ON public.wm_pending_orders      FROM anon, authenticated;
REVOKE ALL ON public.wm_pending_order_items FROM anon, authenticated;
GRANT ALL ON public.wm_pending_orders, public.wm_pending_order_items TO service_role;

ALTER TABLE public.wm_pending_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wm_pending_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manage wm pending orders" ON public.wm_pending_orders;
CREATE POLICY "Service role manage wm pending orders"
    ON public.wm_pending_orders FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage wm pending order items" ON public.wm_pending_order_items;
CREATE POLICY "Service role manage wm pending order items"
    ON public.wm_pending_order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;

-- Recarrega o cache de schema do PostgREST para expor o relacionamento pai/filha
NOTIFY pgrst, 'reload schema';
