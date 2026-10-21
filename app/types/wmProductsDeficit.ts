// Contrato de Balanço de Estoque e Necessidade por Produto (Demanda vs Estoque ITKSoft)

export interface WmProductOrderRef {
  codigo_itk: string
  pedido_cliente: string | null
  filial: string
  emissao: string | null
  qtd_pendente: number
  valor_pendente: number
}

export interface WmProductDeficitItem {
  cod_produto: string
  descricao: string
  part_number: string
  unidade: string
  origem: string
  qtd_pedida: number
  qtd_faturada: number
  qtd_pendente: number
  valor_pendente: number
  saldo_estoque: number
  reservado_estoque: number
  disponivel_estoque: number
  falta_para_quitar: number
  falta_disp_livre: number
  status_estoque: 'Falta Estoque' | 'Estoque Suficiente'
  pedidos_count: number
  pedidos: WmProductOrderRef[]
}

export interface WmProductsDeficitPayload {
  synced_at: string
  total_produtos: number
  produtos_com_deficit: number
  produtos_com_estoque_ok: number
  total_pecas_faltantes: number
  produtos: WmProductDeficitItem[]
}
