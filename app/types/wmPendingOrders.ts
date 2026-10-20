// Contrato compartilhado (servidor ↔ cliente) do painel de pendências WHITE MARTINS.
// Localizado dentro de app/types/ para compatibilidade total com srcDir: 'app' no Nuxt/Vite/Nitro.

export const WM_REGIONS = ['Sudeste', 'Nordeste', 'Centro-Oeste', 'Sul', 'Norte'] as const
export type WmRegion = (typeof WM_REGIONS)[number]

export const WM_BILLING_STATUSES = [
  '100% Pendente',
  'Parcialmente Faturado',
  'Pré-Nota Gerada (Em Faturamento)'
] as const
export type WmBillingStatus = (typeof WM_BILLING_STATUSES)[number]

export const WM_ORIGINS = ['Importado', 'Nacional'] as const
export type WmOrigin = (typeof WM_ORIGINS)[number]

export interface WmPendingItem {
  seq: string
  productCode: string
  description: string
  partNumber: string | null
  unit: string | null
  origin: WmOrigin
  qtyOrdered: number
  qtyInvoiced: number
  qtyCanceled: number
  qtyPending: number
  unitPrice: number
  totalItem: number
  totalInvoiced: number
  totalPending: number
  invoiceNumber: string | null
  preInvoice: string | null
  clientOrderItem: string | null
  customProduct?: string | null
  itemNotes?: string | null
  clientProductCode?: string | null
}

export interface WmPendingOrder {
  itkCode: string
  issuedAt: string // YYYY-MM-DD
  clientOrder: string | null
  clientCode: string
  clientName: string
  clientTradeName: string | null
  clientCnpj: string | null
  branch: string
  city: string | null
  state: string | null
  region: WmRegion
  totalValue: number
  invoicedValue: number
  pendingValue: number
  billingStatus: WmBillingStatus
  packingLists: string[]
  pickingOrders: string[]
  invoices: string[]
  logisticsStatus: string | null
  items: WmPendingItem[]
}

export interface WmPendingOrdersResponse {
  orders: WmPendingOrder[]
  syncedAt: string | null
}
