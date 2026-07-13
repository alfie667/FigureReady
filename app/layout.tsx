import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const BASE = 'https://figure-ready.vercel.app'

export const metadata: Metadata = {
  title: 'FigureReady',
  description: 'Publication-ready figures from Excel',
  metadataBase: new URL(BASE),
  verification: {
    google: 'rKpiINHe1-o2E0b9YImIqejs2YeCxejo7_SilCYGcQM',
  },
  openGraph: {
    siteName: 'FigureReady',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'FigureReady — Publication-ready figures from Excel' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className="font-sans antialiased bg-slate-50">
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-D5DQ01SFSW" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-D5DQ01SFSW');
        `}</Script>
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
