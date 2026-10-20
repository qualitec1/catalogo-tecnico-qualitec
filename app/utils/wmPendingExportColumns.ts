// Colunas de exportação (uma linha por item, com os dados do pedido) do painel WHITE MARTINS.
import type { WmPendingItem, WmPendingOrder } from '../../shared/types/wmPendingOrders'
import type { ExportColumn } from './tableExport'
import { billingStatusLabel, formatIsoDate } from './wmPendingFormat'

export interface WmExportRow {
  order: WmPendingOrder & { daysOpen: number }
  item: WmPendingItem
}

const money = (v: number) => Math.round(v * 100) / 100

export const wmExportColumns: ExportColumn<WmExportRow>[] = [
  { header: 'Região', value: (r) => r.order.region },
  { header: 'Filial', value: (r) => r.order.branch },
  { header: 'UF', value: (r) => r.order.state },
  { header: 'CNPJ', value: (r) => r.order.clientCnpj },
  { header: 'Pedido ITK', value: (r) => r.order.itkCode },
  { header: 'Pedido Cliente', value: (r) => r.order.clientOrder },
  { header: 'Emissão', value: (r) => formatIsoDate(r.order.issuedAt) },
  { header: 'Dias em Aberto', value: (r) => r.order.daysOpen },
  { header: 'Status Faturamento', value: (r) => billingStatusLabel(r.order.billingStatus) },
  { header: 'Status Logístico', value: (r) => r.order.logisticsStatus },
  { header: 'Valor Total Pedido', value: (r) => money(r.order.totalValue) },
  { header: 'Valor Faturado Pedido', value: (r) => money(r.order.invoicedValue) },
  { header: 'Valor Pendente Pedido', value: (r) => money(r.order.pendingValue) },
  { header: 'Seq', value: (r) => r.item.seq },
  { header: 'Part Number', value: (r) => r.item.partNumber },
  { header: 'Código', value: (r) => r.item.productCode },
  { header: 'Descrição', value: (r) => r.item.description },
  { header: 'Unidade', value: (r) => r.item.unit },
  { header: 'Origem', value: (r) => r.item.origin },
  { header: 'Qtd Pedida', value: (r) => r.item.qtyOrdered },
  { header: 'Qtd Faturada', value: (r) => r.item.qtyInvoiced },
  { header: 'Qtd Pendente', value: (r) => r.item.qtyPending },
  { header: 'Preço Unitário', value: (r) => money(r.item.unitPrice) },
  { header: 'Valor Pendente Item', value: (r) => money(r.item.totalPending) }
]
