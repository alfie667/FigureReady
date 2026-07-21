'use client'
import * as XLSX from 'xlsx'
import { gtagEvent } from '@/lib/ga'

const rows = [
  { 'X (Concentration mM)': 0,   'Sample A (Absorbance)': 0.02, 'Sample B (Absorbance)': 0.01 },
  { 'X (Concentration mM)': 0.5, 'Sample A (Absorbance)': 0.18, 'Sample B (Absorbance)': 0.09 },
  { 'X (Concentration mM)': 1.0, 'Sample A (Absorbance)': 0.31, 'Sample B (Absorbance)': 0.14 },
  { 'X (Concentration mM)': 1.5, 'Sample A (Absorbance)': 0.42, 'Sample B (Absorbance)': 0.22 },
  { 'X (Concentration mM)': 2.0, 'Sample A (Absorbance)': 0.58, 'Sample B (Absorbance)': 0.31 },
  { 'X (Concentration mM)': 2.5, 'Sample A (Absorbance)': 0.67, 'Sample B (Absorbance)': 0.38 },
  { 'X (Concentration mM)': 3.0, 'Sample A (Absorbance)': 0.79, 'Sample B (Absorbance)': 0.45 },
  { 'X (Concentration mM)': 3.5, 'Sample A (Absorbance)': 0.88, 'Sample B (Absorbance)': 0.52 },
  { 'X (Concentration mM)': 4.0, 'Sample A (Absorbance)': 0.95, 'Sample B (Absorbance)': 0.61 },
  { 'X (Concentration mM)': 4.5, 'Sample A (Absorbance)': 1.04, 'Sample B (Absorbance)': 0.68 },
]

export default function SampleDataButton({ className }: { className?: string }) {
  function download() {
    gtagEvent('sample_file_click')
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 24 }, { wch: 24 }, { wch: 24 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Data')
    XLSX.writeFile(wb, 'figureready-sample.xlsx')
  }

  return (
    <button onClick={download} className={className}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Try with sample data
    </button>
  )
}
