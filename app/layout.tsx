import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const BASE = 'https://figureready.com'

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

        {/* Facebook Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '206634508997459');
          fbq('track', 'PageView');
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=206634508997459&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
