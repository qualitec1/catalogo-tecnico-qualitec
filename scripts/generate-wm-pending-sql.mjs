// Gera o SQL de carga/sincronização do snapshot de pedidos pendentes WHITE MARTINS.
// Uso: node scripts/generate-wm-pending-sql.mjs [entrada.json] [saida.sql]
// Padrões: docs/wm_pending_data.json -> docs/wm_pending_data_load.sql
// Pré-requisito no Supabase: migration 20261020120000_create_wm_pending_orders.sql
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const input = resolve(process.argv[2] || 'docs/wm_pending_data.json')
const output = resolve(process.argv[3] || 'docs/wm_pending_data_load.sql')

const REGIONS = ['Sudeste', 'Nordeste', 'Centro-Oeste', 'Sul', 'Norte']
const STATUSES = ['100% Pendente', 'Parcialmente Faturado', 'Pré-Nota Gerada (Em Faturamento)']
const ORIGINS = ['Importado', 'Nacional']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const ORDER_COLS = [
  ['codigo_itk', 'text'], ['emissao', 'date'], ['pedido_cliente', 'text'], ['cliente_codigo', 'text'],
  ['cliente_razao', 'text'], ['cliente_fantasia', 'text'], ['cliente_cnpj', 'text'], ['filial', 'text'],
  ['cidade', 'text'], ['estado', 'text'], ['regiao', 'text'], ['valor_total_pedido', 'num'],
  ['valor_faturado', 'num'], ['valor_pendente', 'num'], ['qtd_total_pedida', 'num'],
  ['qtd_total_faturada', 'num'], ['qtd_total_pendente', 'num'], ['status_faturamento', 'text'],
  ['tem_romaneio', 'bool'], ['romaneios', 'arr'], ['tem_ord_sepa', 'bool'], ['ordens_separacao', 'arr'],
  ['tem_nf', 'bool'], ['nfs_emitidas', 'arr'], ['status_logistico', 'text'], ['observacao', 'text']
]

const ITEM_COLS = [
  ['seq', 'text'], ['cod_produto', 'text'], ['descricao', 'text'], ['part_number', 'text'],
  ['unidade', 'text'], ['origem', 'text'], ['origem_codigo', 'int'], ['quantidade', 'num'],
  ['qtd_fatura', 'num'], ['qtd_libera', 'num'], ['qtd_cancel', 'num'], ['qtd_pendente', 'num'],
  ['unitario', 'num'], ['total_item', 'num'], ['total_faturado', 'num'], ['total_pendente', 'num'],
  ['notafiscal', 'text'], ['datafatura', 'date'], ['pre_nota', 'text'], ['ped_cli', 'text'], ['it_ped_cli', 'text']
]

const str = (v) => `'${String(v).replace(/'/g, "''")}'`

function lit(value, type) {
  if (value === null || value === undefined || (type !== 'text' && value === '')) {
    if (type === 'arr') return `'{}'::text[]`
    if (type === 'bool') return 'FALSE'
    if (type === 'num') return '0'
    return 'NULL'
  }
  switch (type) {
    case 'num': {
      const n = Number(value)
      if (!Number.isFinite(n)) throw new Error(`Valor numérico inválido: ${value}`)
      return String(n)
    }
    case 'int': return String(Math.trunc(Number(value)))
    case 'bool': return value ? 'TRUE' : 'FALSE'
    case 'date': {
      if (!DATE_RE.test(String(value))) throw new Error(`Data inválida: ${value}`)
      return `${str(value)}::date`
    }
    case 'arr': {
      if (!Array.isArray(value)) throw new Error(`Lista inválida: ${value}`)
      return value.length ? `ARRAY[${value.map(str).join(', ')}]::text[]` : `'{}'::text[]`
    }
    default: return str(value)
  }
}

function validate(orders) {
  if (!Array.isArray(orders) || !orders.length) throw new Error('JSON vazio ou inválido.')
  const seen = new Set()
  for (const o of orders) {
    const id = o.codigo_itk
    if (!id) throw new Error('Pedido sem codigo_itk.')
    if (seen.has(id)) throw new Error(`Pedido duplicado: ${id}`)
    seen.add(id)
    if (!REGIONS.includes(o.regiao)) throw new Error(`Região desconhecida no pedido ${id}: ${o.regiao}`)
    if (!STATUSES.includes(o.status_faturamento)) throw new Error(`Status desconhecido no pedido ${id}: ${o.status_faturamento}`)
    const seqs = new Set()
    for (const it of o.items || []) {
      if (!it.seq || seqs.has(it.seq)) throw new Error(`Item sem seq ou duplicado no pedido ${id}: ${it.seq}`)
      seqs.add(it.seq)
      if (!ORIGINS.includes(it.origem)) throw new Error(`Origem desconhecida no pedido ${id}/${it.seq}: ${it.origem}`)
    }
  }
}

const upsertSet = (cols, skip) => cols
  .filter(([c]) => !skip.includes(c))
  .map(([c]) => `${c} = EXCLUDED.${c}`)
  .concat(['synced_at = now()', 'updated_at = now()'])
  .join(',\n    ')

const orders = JSON.parse(readFileSync(input, 'utf8').replace(/^\uFEFF/, ''))
validate(orders)

const orderRows = orders.map((o) => `  (${ORDER_COLS.map(([c, t]) => lit(o[c], t)).join(', ')})`)
const itemRows = []
const itemKeys = []
for (const o of orders) {
  for (const it of o.items || []) {
    itemRows.push(`  (${[lit(o.codigo_itk, 'text'), ...ITEM_COLS.map(([c, t]) => lit(it[c], t))].join(', ')})`)
    itemKeys.push(`(${str(o.codigo_itk)}, ${str(it.seq)})`)
  }
}

const totalPending = orders.reduce((s, o) => s + Number(o.valor_pendente || 0), 0)
const sql = `-- ============================================================================
-- SCRIPT COMPLETO E AUTOCONTIDO: CRIAÇÃO E CARGA DE PEDIDOS WHITE MARTINS
-- Gerado por scripts/generate-wm-pending-sql.mjs — Seguro e Idempotente.
-- Pedidos: ${orders.length} | Itens: ${itemRows.length} | Pendente: R$ ${totalPending.toFixed(2)}
-- ============================================================================

BEGIN;

-- 1. CRIAÇÃO DAS TABELAS (SE NÃO EXISTIREM)
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

CREATE INDEX IF NOT EXISTS wm_pending_order_items_pendente_idx
    ON public.wm_pending_order_items (total_pendente DESC)
    WHERE qtd_pendente > 0;

-- 2. SEGURANÇA E RLS (Service role exclusiva)
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

-- 3. CARGA / ATUALIZAÇÃO DOS PEDIDOS
INSERT INTO public.wm_pending_orders (${ORDER_COLS.map(([c]) => c).join(', ')})
VALUES
${orderRows.join(',\n')}
ON CONFLICT (codigo_itk) DO UPDATE SET
    ${upsertSet(ORDER_COLS, ['codigo_itk'])};

INSERT INTO public.wm_pending_order_items (order_codigo_itk, ${ITEM_COLS.map(([c]) => c).join(', ')})
VALUES
${itemRows.join(',\n')}
ON CONFLICT (order_codigo_itk, seq) DO UPDATE SET
    ${upsertSet(ITEM_COLS, ['seq'])};

-- Remove itens que saíram do snapshot
DELETE FROM public.wm_pending_order_items i
WHERE (i.order_codigo_itk, i.seq) NOT IN (VALUES
  ${itemKeys.join(',\n  ')}
);

-- Remove pedidos que saíram do snapshot (itens removidos via ON DELETE CASCADE)
DELETE FROM public.wm_pending_orders
WHERE codigo_itk NOT IN (${orders.map((o) => str(o.codigo_itk)).join(', ')});

COMMIT;

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';

-- Conferência (esperado: ${orders.length} pedidos / ${itemRows.length} itens)
SELECT
  (SELECT count(*) FROM public.wm_pending_orders) AS pedidos,
  (SELECT count(*) FROM public.wm_pending_order_items) AS itens,
  (SELECT round(sum(valor_pendente), 2) FROM public.wm_pending_orders) AS valor_pendente;
`

writeFileSync(output, sql, 'utf8')
console.log(`SQL gerado: ${output}`)
console.log(`Pedidos: ${orders.length} | Itens: ${itemRows.length} | Pendente: R$ ${totalPending.toFixed(2)}`)
