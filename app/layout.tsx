import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AnalyticsPageView } from '@/components/AnalyticsPageView'

const inter = Inter({ subsets: ['latin'] })
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-plus-jakarta',
})

const BASE  = 'https://figureready.com'
const GA_ID = 'G-D5DQ01SFSW'

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
      <body className={`${inter.className} ${plusJakarta.variable} antialiased bg-white`}>
        {children}

        {/* SPA page_view + UTM/GCLID capture */}
        <AnalyticsPageView />

        {/*
          Google Consent Mode v2 — MUST run before the GA4 gtag.js loads.
          Current defaults: analytics granted (no change to existing behaviour),
          ads denied (not running GA4 ads). When you add a consent banner,
          call updateConsent() from lib/analytics.ts to update these values.
        */}
        <Script id="consent-mode" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage:        'denied',
            ad_user_data:      'denied',
            ad_personalization:'denied',
            wait_for_update:   500
          });
        `}</Script>

        {/* GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          if (new URLSearchParams(window.location.search).get('debug_ga4') === '1') {
            sessionStorage.setItem('ga4_debug', '1');
          }
          var _ga_debug =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            sessionStorage.getItem('ga4_debug') === '1';
          gtag('config', '${GA_ID}', { send_page_view: true, debug_mode: _ga_debug });
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
