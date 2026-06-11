import * as XLSX from 'xlsx'

export interface ParsedData {
  columns: string[]
  rows: Record<string, unknown>[]
}

export async function parseExcelFile(file: File): Promise<ParsedData> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []
  return { columns, rows }
}
