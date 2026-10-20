// Funções puras de formatação do painel de pendências WHITE MARTINS.
import type { WmBillingStatus, WmOrigin } from '../../shared/types/wmPendingOrders'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const qty = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 })
const DAY_MS = 86_400_000

export const formatBRL = (value: number): string => brl.format(value)
export const formatQty = (value: number): string => qty.format(value)

/** Converte 'YYYY-MM-DD' em 'DD/MM/YYYY' sem depender de fuso horário. */
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

/** Dias corridos entre a emissão ('YYYY-MM-DD') e a data de referência (UTC). */
export function daysBetween(iso: string, reference: Date): number {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const start = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)
  const end = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate())
  return Math.max(0, Math.round((end - start) / DAY_MS))
}

export function billingStatusClass(status: WmBillingStatus): string {
  if (status === '100% Pendente') return 'wm-badge wm-badge--danger'
  if (status === 'Parcialmente Faturado') return 'wm-badge wm-badge--warning'
  return 'wm-badge wm-badge--info'
}

export function billingStatusLabel(status: WmBillingStatus): string {
  return status === 'Pré-Nota Gerada (Em Faturamento)' ? 'Pré-Nota Gerada' : status
}

export const originClass = (origin: WmOrigin): string =>
  origin === 'Importado' ? 'wm-badge wm-badge--imported' : 'wm-badge wm-badge--national'

/** Classe de urgência para "dias em aberto". */
export function agingClass(days: number): string {
  if (days > 90) return 'wm-aging wm-aging--critical'
  if (days > 30) return 'wm-aging wm-aging--warning'
  return 'wm-aging wm-aging--ok'
}

export const invoicedPercent = (total: number, invoiced: number): number =>
  total > 0 ? Math.min(100, Math.round((invoiced / total) * 100)) : 0

/** Normaliza texto para busca (minúsculas, sem acentos). */
export const normalizeSearch = (value: string | null | undefined): string =>
  (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
