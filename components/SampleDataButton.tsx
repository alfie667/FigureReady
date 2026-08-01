'use client'
import { useRouter } from 'next/navigation'
import { trackSampleCtaClick } from '@/lib/analytics'

// Kept here because app/app/page.tsx imports SAMPLE_ROWS directly
export const SAMPLE_ROWS = [
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
  const router = useRouter()

  function handleClick() {
    trackSampleCtaClick()
    router.push('/app?demo=1')
  }

  return (
    <button onClick={handleClick} className={className}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Try a Live Demo
    </button>
  )
}
