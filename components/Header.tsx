'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { isProUser } from '@/lib/usageLimit'
import { LogoFull } from '@/components/Logo'

interface Props {
  hasData: boolean
  onReset: () => void
  onUpgrade?: () => void
  onExportSVG?: () => void
  onExportPNG?: () => void
  onExportPDF?: () => void
  onShareLink?: () => void
}

const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

export default function Header({ hasData, onReset, onExportSVG, onExportPNG, onExportPDF, onShareLink }: Props) {
  const [isPro, setIsPro] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsPro(isProUser())
  }, [])

  const handleShare = () => {
    onShareLink?.()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-slate-200/80 bg-white shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <LogoFull size={30} textSize={15} />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {isPro && (
          <span className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full bg-[#dbeafe] text-[#2563eb]">
            Pro
          </span>
        )}

        {hasData && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            New figure
          </button>
        )}

        {hasData && onShareLink && (
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Share
              </>
            )}
          </button>
        )}

        {hasData && onExportSVG && (
          <button
            onClick={onExportSVG}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <DownloadIcon />SVG
          </button>
        )}

        {hasData && onExportPDF && (
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <DownloadIcon />PDF
          </button>
        )}

        {hasData && onExportPNG && (
          <button
            onClick={onExportPNG}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            <DownloadIcon />{isPro ? 'PNG · 300 DPI' : 'Export PNG'}
          </button>
        )}
      </div>
    </header>
  )
}
