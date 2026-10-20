import { computed, reactive, ref, shallowRef, watch } from 'vue'
import type {
  WmBillingStatus,
  WmOrigin,
  WmPendingItem,
  WmPendingOrder,
  WmPendingOrdersResponse,
  WmRegion
} from '../../shared/types/wmPendingOrders'
import { daysBetween, normalizeSearch } from '../utils/wmPendingFormat'

export type WmSortOrder = 'oldest' | 'newest' | 'pending_desc'
export type WmRankingMode = 'total' | 'unit'

export interface WmFilters {
  region: WmRegion | ''
  branch: string
  status: WmBillingStatus | ''
  origin: WmOrigin | ''
  sort: WmSortOrder
  dateFrom: string
  dateTo: string
  search: string
}

export interface WmOrderView extends WmPendingOrder {
  daysOpen: number
}

export interface WmRankedItem {
  key: string
  item: WmPendingItem
  order: WmOrderView
}

export interface WmKpis {
  pendingTotal: number
  openOrders: number
  fullyPending: number
  partial: number
  preInvoice: number
  imported: { value: number; count: number }
  national: { value: number; count: number }
}

const defaultFilters = (): WmFilters => ({
  region: '', branch: '', status: '', origin: '', sort: 'oldest', dateFrom: '', dateTo: '', search: ''
})

const hasPending = (i: WmPendingItem) => i.qtyPending > 0

function matchesOrigin(order: WmPendingOrder, origin: WmOrigin): boolean {
  const pending = order.items.filter(hasPending)
  return (pending.length ? pending : order.items).some((i) => i.origin === origin)
}

function matchesSearch(order: WmPendingOrder, term: string): boolean {
  const fields = [order.itkCode, order.clientOrder, order.branch, order.clientTradeName]
  for (const i of order.items) fields.push(i.description, i.partNumber, i.productCode)
  return fields.some((f) => normalizeSearch(f).includes(term))
}

export function useWmPendingOrders() {
  const orders = shallowRef<WmOrderView[]>([])
  const syncedAt = ref<string | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const filters = reactive<WmFilters>(defaultFilters())
  const rankingMode = ref<WmRankingMode>('total')

  async function load(): Promise<void> {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await $fetch<WmPendingOrdersResponse>('/api/admin/pedidos-white-martins')
      const today = new Date()
      orders.value = res.orders.map((o) => ({ ...o, daysOpen: daysBetween(o.issuedAt, today) }))
      syncedAt.value = res.syncedAt
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode
      errorMessage.value = status === 401 || status === 403
        ? 'Sessão expirada ou sem permissão. Faça login novamente.'
        : 'Não foi possível carregar os pedidos pendentes. Tente novamente.'
    } finally {
      loading.value = false
    }
  }

  const branchOptions = computed(() => {
    const source = filters.region ? orders.value.filter((o) => o.region === filters.region) : orders.value
    return [...new Set(source.map((o) => o.branch))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  })

  // Ao trocar de região, descarta a filial que não pertence à nova região
  watch(() => filters.region, () => {
    if (filters.branch && !branchOptions.value.includes(filters.branch)) filters.branch = ''
  })

  const filteredOrders = computed<WmOrderView[]>(() => {
    const term = normalizeSearch(filters.search.trim())
    const list = orders.value.filter((o) =>
      (!filters.region || o.region === filters.region) &&
      (!filters.branch || o.branch === filters.branch) &&
      (!filters.status || o.billingStatus === filters.status) &&
      (!filters.origin || matchesOrigin(o, filters.origin)) &&
      (!filters.dateFrom || o.issuedAt >= filters.dateFrom) &&
      (!filters.dateTo || o.issuedAt <= filters.dateTo) &&
      (!term || matchesSearch(o, term))
    )
    const byDate = (a: WmOrderView, b: WmOrderView) => a.issuedAt.localeCompare(b.issuedAt) || a.itkCode.localeCompare(b.itkCode)
    if (filters.sort === 'newest') return list.sort((a, b) => byDate(b, a))
    if (filters.sort === 'pending_desc') return list.sort((a, b) => b.pendingValue - a.pendingValue)
    return list.sort(byDate)
  })

  const kpis = computed<WmKpis>(() => {
    const k: WmKpis = {
      pendingTotal: 0, openOrders: 0, fullyPending: 0, partial: 0, preInvoice: 0,
      imported: { value: 0, count: 0 }, national: { value: 0, count: 0 }
    }
    for (const o of filteredOrders.value) {
      k.pendingTotal += o.pendingValue
      k.openOrders += 1
      if (o.billingStatus === '100% Pendente') k.fullyPending += 1
      else if (o.billingStatus === 'Parcialmente Faturado') k.partial += 1
      else k.preInvoice += 1
      for (const i of o.items.filter(hasPending)) {
        const bucket = i.origin === 'Importado' ? k.imported : k.national
        bucket.value += i.totalPending
        bucket.count += 1
      }
    }
    return k
  })

  const rankedItems = computed<WmRankedItem[]>(() => {
    const term = normalizeSearch(filters.search.trim())
    const hit = (values: (string | null)[]) => values.some((v) => normalizeSearch(v).includes(term))
    const rows: WmRankedItem[] = []
    for (const order of filteredOrders.value) {
      const orderHit = !term || hit([order.itkCode, order.clientOrder, order.branch, order.clientTradeName])
      for (const item of order.items) {
        if (!hasPending(item) || (filters.origin && item.origin !== filters.origin)) continue
        if (!orderHit && !hit([item.description, item.partNumber, item.productCode])) continue
        rows.push({ key: `${order.itkCode}-${item.seq}`, item, order })
      }
    }
    const metric = (r: WmRankedItem) => (rankingMode.value === 'unit' ? r.item.unitPrice : r.item.totalPending)
    return rows.sort((a, b) => metric(b) - metric(a))
  })

  const hasActiveFilters = computed(() => {
    const d = defaultFilters()
    return (Object.keys(d) as (keyof WmFilters)[]).some((k) => k !== 'sort' && filters[k] !== d[k])
  })

  function resetFilters(): void {
    Object.assign(filters, defaultFilters())
  }

  return {
    orders, syncedAt, loading, errorMessage, filters, rankingMode,
    branchOptions, filteredOrders, kpis, rankedItems, hasActiveFilters,
    load, resetFilters
  }
}
