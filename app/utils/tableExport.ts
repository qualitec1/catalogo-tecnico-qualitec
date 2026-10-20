// Exportação de tabelas para CSV (Excel pt-BR) ou Excel (.xls SpreadsheetML), sem dependências.

export type ExportCell = string | number | null | undefined
export type ExportFormat = 'csv' | 'xls'

export interface ExportColumn<T> {
  header: string
  value: (row: T) => ExportCell
}

const csvCell = (cell: ExportCell): string => {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'number') return String(cell).replace('.', ',')
  const text = String(cell)
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const xmlEscape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const xmlCell = (cell: ExportCell): string => {
  if (typeof cell === 'number' && Number.isFinite(cell)) {
    return `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(cell === null || cell === undefined ? '' : String(cell))}</Data></Cell>`
}

function buildCsv<T>(columns: ExportColumn<T>[], rows: T[]): string {
  const lines = [columns.map((c) => csvCell(c.header)).join(';')]
  for (const row of rows) lines.push(columns.map((c) => csvCell(c.value(row))).join(';'))
  // BOM para o Excel reconhecer UTF-8; ';' é o separador padrão do Excel pt-BR
  return '\uFEFF' + lines.join('\r\n')
}

function buildXls<T>(columns: ExportColumn<T>[], rows: T[], sheetName: string): string {
  const header = `<Row>${columns.map((c) => `<Cell ss:StyleID="h"><Data ss:Type="String">${xmlEscape(c.header)}</Data></Cell>`).join('')}</Row>`
  const body = rows.map((row) => `<Row>${columns.map((c) => xmlCell(c.value(row))).join('')}</Row>`).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="${xmlEscape(sheetName.slice(0, 31))}"><Table>${header}${body}</Table></Worksheet>
</Workbook>`
}

/** Gera e baixa o arquivo no navegador. Deve ser chamado apenas no cliente. */
export function downloadTable<T>(
  columns: ExportColumn<T>[],
  rows: T[],
  format: ExportFormat,
  baseName: string
): void {
  const content = format === 'csv' ? buildCsv(columns, rows) : buildXls(columns, rows, baseName)
  const mime = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel'
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${baseName}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
