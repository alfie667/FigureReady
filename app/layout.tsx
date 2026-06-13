import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FigureReady',
  description: 'Publication-ready figures from Excel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className="font-sans antialiased bg-slate-50">{children}</body>
    </html>
  )
}
