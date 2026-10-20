import { createError } from 'h3'
import { supabaseAdmin } from '../utils/supabaseAdmin'
import type {
  WmBillingStatus,
  WmOrigin,
  WmPendingItem,
  WmPendingOrder,
  WmPendingOrdersResponse,
  WmRegion
} from '../../../shared/types/wmPendingOrders'

interface ItemRow {
  seq: string
  cod_produto: string
  descricao: string
  part_number: string | null
  unidade: string | null
  origem: string
  quantidade: number | string
  qtd_fatura: number | string
  qtd_cancel: number | string
  qtd_pendente: number | string
  unitario: number | string
  total_item: number | string
  total_faturado: number | string
  total_pendente: number | string
  notafiscal: string | null
  pre_nota: string | null
  it_ped_cli: string | null
}

interface OrderRow {
  codigo_itk: string
  emissao: string
  pedido_cliente: string | null
  cliente_codigo: string
  cliente_razao: string
  cliente_fantasia: string | null
  cliente_cnpj: string | null
  filial: string
  cidade: string | null
  estado: string | null
  regiao: string
  valor_total_pedido: number | string
  valor_faturado: number | string
  valor_pendente: number | string
  status_faturamento: string
  romaneios: string[] | null
  ordens_separacao: string[] | null
  nfs_emitidas: string[] | null
  status_logistico: string | null
  synced_at: string
  items: ItemRow[] | null
}

const ORDER_SELECT = `codigo_itk, emissao, pedido_cliente, cliente_codigo, cliente_razao, cliente_fantasia,
  cliente_cnpj, filial, cidade, estado, regiao, valor_total_pedido, valor_faturado, valor_pendente,
  status_faturamento, romaneios, ordens_separacao, nfs_emitidas, status_logistico, synced_at,
  items:wm_pending_order_items (seq, cod_produto, descricao, part_number, unidade, origem, quantidade,
  qtd_fatura, qtd_cancel, qtd_pendente, unitario, total_item, total_faturado, total_pendente,
  notafiscal, pre_nota, it_ped_cli)`

const num = (v: number | string | null | undefined): number => {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

function mapItem(row: ItemRow): WmPendingItem {
  return {
    seq: row.seq,
    productCode: row.cod_produto,
    description: row.descricao,
    partNumber: row.part_number,
    unit: row.unidade,
    origin: row.origem as WmOrigin, // garantido pelo CHECK constraint
    qtyOrdered: num(row.quantidade),
    qtyInvoiced: num(row.qtd_fatura),
    qtyCanceled: num(row.qtd_cancel),
    qtyPending: num(row.qtd_pendente),
    unitPrice: num(row.unitario),
    totalItem: num(row.total_item),
    totalInvoiced: num(row.total_faturado),
    totalPending: num(row.total_pendente),
    invoiceNumber: row.notafiscal,
    preInvoice: row.pre_nota,
    clientOrderItem: row.it_ped_cli
  }
}

function mapOrder(row: OrderRow): WmPendingOrder {
  const items = (row.items ?? []).map(mapItem).sort((a, b) => a.seq.localeCompare(b.seq))
  return {
    itkCode: row.codigo_itk,
    issuedAt: row.emissao,
    clientOrder: row.pedido_cliente,
    clientCode: row.cliente_codigo,
    clientName: row.cliente_razao,
    clientTradeName: row.cliente_fantasia,
    clientCnpj: row.cliente_cnpj,
    branch: row.filial,
    city: row.cidade,
    state: row.estado,
    region: row.regiao as WmRegion, // garantido pelo CHECK constraint
    totalValue: num(row.valor_total_pedido),
    invoicedValue: num(row.valor_faturado),
    pendingValue: num(row.valor_pendente),
    billingStatus: row.status_faturamento as WmBillingStatus, // garantido pelo CHECK constraint
    packingLists: row.romaneios ?? [],
    pickingOrders: row.ordens_separacao ?? [],
    invoices: row.nfs_emitidas ?? [],
    logisticsStatus: row.status_logistico,
    items
  }
}

/** Lê o espelho de pedidos pendentes WHITE MARTINS (somente leitura, service_role). */
export async function listWmPendingOrders(): Promise<WmPendingOrdersResponse> {
  // 1. Tentar ler do Supabase (prioridade máxima)
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('wm_pending_orders')
        .select(ORDER_SELECT)
        .order('emissao', { ascending: true })
        .range(0, 4999)

      if (!error && data && data.length > 0) {
        const rows = data as OrderRow[]
        const syncedAt = rows.reduce<string | null>(
          (latest, r) => (!latest || r.synced_at > latest ? r.synced_at : latest),
          null
        )
        return { orders: rows.map(mapOrder), syncedAt }
      }

      if (error) {
        console.warn('[wmPendingOrders] Supabase retornou aviso/erro:', error.message)
      }
    } catch (dbErr: any) {
      console.warn('[wmPendingOrders] Falha de conexão Supabase:', dbErr?.message)
    }
  }

  // 2. Fallback de contingência: ler snapshot JSON local (docs/wm_pending_data.json)
  try {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const jsonPath = path.resolve(process.cwd(), 'docs/wm_pending_data.json')
    const raw = await fs.readFile(jsonPath, 'utf-8')
    const jsonOrders = JSON.parse(raw.replace(/^\uFEFF/, ''))

    const fallbackOrders: WmPendingOrder[] = jsonOrders.map((o: any) => ({
      itkCode: o.codigo_itk,
      issuedAt: o.emissao,
      clientOrder: o.pedido_cliente || null,
      clientCode: o.cliente_codigo,
      clientName: o.cliente_razao,
      clientTradeName: o.cliente_fantasia || null,
      clientCnpj: o.cliente_cnpj || null,
      branch: o.filial,
      city: o.cidade || null,
      state: o.estado || null,
      region: o.regiao as WmRegion,
      totalValue: num(o.valor_total_pedido),
      invoicedValue: num(o.valor_faturado),
      pendingValue: num(o.valor_pendente),
      billingStatus: o.status_faturamento as WmBillingStatus,
      packingLists: o.romaneios || [],
      pickingOrders: o.ordens_separacao || [],
      invoices: o.nfs_emitidas || [],
      logisticsStatus: o.status_logistico || null,
      items: (o.items || []).map((i: any) => ({
        seq: i.seq,
        productCode: i.cod_produto,
        description: i.descricao,
        partNumber: i.part_number || null,
        unit: i.unidade || 'UN',
        origin: (i.origem || 'Nacional') as WmOrigin,
        qtyOrdered: num(i.quantidade),
        qtyInvoiced: num(i.qtd_fatura),
        qtyCanceled: num(i.qtd_cancel),
        qtyPending: num(i.qtd_pendente),
        unitPrice: num(i.unitario),
        totalItem: num(i.total_item),
        totalInvoiced: num(i.total_faturado),
        totalPending: num(i.total_pendente),
        invoiceNumber: i.notafiscal || null,
        preInvoice: i.pre_nota || null,
        clientOrderItem: i.it_ped_cli || null
      }))
    }))

    return {
      orders: fallbackOrders,
      syncedAt: new Date().toISOString()
    }
  } catch (fsErr: any) {
    console.error('[wmPendingOrders] Erro ao ler fallback JSON:', fsErr)
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível carregar os pedidos pendentes.'
    })
  }
}
