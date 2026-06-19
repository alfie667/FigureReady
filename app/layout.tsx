import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'FigureReady',
  description: 'Publication-ready figures from Excel',
  verification: {
    google: 'rKpiINHe1-o2E0b9YImIqejs2YeCxejo7_SilCYGcQM',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className="font-sans antialiased bg-slate-50">
        {children}
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
