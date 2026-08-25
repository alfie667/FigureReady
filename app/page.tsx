import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import PricingSection from './home-v2/PricingSection'

export const metadata: Metadata = {
  title: 'FigureReady — Turn scientific data into publication-ready figures',
  description:
    'Upload your Excel data, choose a scientific template, refine your figure, and export it for publication. No code, no GraphPad, no Origin.',
  alternates: { canonical: 'https://figureready.com' },
  openGraph: {
    title: 'FigureReady — Turn scientific data into publication-ready figures',
    description:
      'Upload your Excel data, choose a scientific template, refine your figure, and export it for publication.',
    url: 'https://figureready.com',
    type: 'website',
    siteName: 'FigureReady',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FigureReady — Turn scientific data into publication-ready figures',
    description:
      'Upload your Excel data, choose a scientific template, refine your figure, and export it for publication.',
    images: ['/opengraph-image'],
  },
}

const LOGO_STYLE: React.CSSProperties = {
  height: '36px',
  width: 'auto',
  maxWidth: '240px',
  objectFit: 'contain' as const,
  filter: 'brightness(0) saturate(0) invert(44%) sepia(18%) saturate(600%) hue-rotate(185deg) opacity(0.85)',
}

const LOGOS = [
  { name: 'MIT',               src: '/logos/mit.svg' },
  { name: 'Stanford',         src: '/logos/stanford-wm.svg' },
  { name: 'ETH Zürich',       src: '/logos/eth.svg' },
  { name: 'Harvard',          src: '/logos/harvard-wm.svg' },
  { name: 'Max Planck',       src: '/logos/maxplanck.svg' },
  { name: 'Yale University',  src: '/logos/yale-wm.svg' },
  { name: 'Imperial College', src: '/logos/imperial-wm.svg' },
  { name: 'UC Berkeley',      src: '/logos/berkeley-wm.svg' },
]

function ArrowRight() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" aria-label="FigureReady home">
            <LogoFull size={28} textSize={15} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/templates" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Templates
            </Link>
            <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <Link href="/roadmap" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Roadmap
            </Link>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Create a figure
          </Link>
        </div>
      </nav>

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Text — 45% */}
          <div className="w-full md:w-[44%] shrink-0">
            <h1
              className="font-extrabold text-[2.5rem] leading-[1.08] tracking-[-0.03em] md:text-[3.5rem] text-[#0f172a] mb-6"
              style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
            >
              Turn scientific data into publication-ready figures.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-9 max-w-[460px]">
              Upload your data, choose a scientific template, refine your figure, and export it for
              publication — without rebuilding every plot from scratch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link
                href="/app"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                Create a figure
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-semibold text-[15px] px-6 py-3.5 rounded-xl transition-colors"
              >
                Explore templates
              </Link>
            </div>
            <p className="text-sm text-slate-400 tracking-wide">
              Start from Excel · No installation · Publication-ready export
            </p>
          </div>

          {/* Illustration — 55% */}
          <div className="w-full md:w-[56%]">
            <Image
              src="/home-v2/hero.png"
              alt="FigureReady editor — multi-series XRD chart with 300 DPI, SVG, PDF and PNG export"
              width={800}
              height={560}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── 2. DEMO VIDEO ────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 py-20 md:py-28 bg-[#f8fafc]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold tracking-[0.16em] uppercase text-blue-600 mb-3">
              See it in action
            </span>
            <h2
              className="font-bold text-[1.8rem] md:text-[2.5rem] leading-tight tracking-[-0.02em] text-[#0f172a]"
              style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
            >
              From raw data to publication-ready figure in seconds
            </h2>
          </div>
          <div className="relative mx-auto max-w-[960px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-1.5 px-4 h-9 bg-slate-100 border-b border-slate-200">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="mx-auto text-xs text-slate-400 font-medium">figureready.com/app</span>
            </div>
            <video
              src="/home-v2/demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full block"
            />
          </div>
        </div>
      </section>

      {/* ── UNIVERSITY LOGOS MARQUEE ─────────────────────────────────── */}
      <section className="py-14 bg-[#f9fafb] border-t border-slate-100">
        <p className="text-center text-sm text-slate-400 mb-10 tracking-wide">
          Trusted by researchers from leading institutions
        </p>
        <div className="overflow-hidden">
          <div className="animate-marquee flex items-center">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <span key={i} className="flex items-center justify-center shrink-0 px-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={logo.name} style={LOGO_STYLE} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 py-20 md:py-28 bg-[#f8fafc]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-[0.16em] uppercase text-blue-600 mb-3">
              Testimonials
            </span>
            <h2
              className="font-bold text-[1.8rem] md:text-[2.5rem] leading-tight tracking-[-0.02em] text-[#0f172a]"
              style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
            >
              Researchers switching from OriginLab &amp; Prism
            </h2>
            <p className="mt-4 text-base text-slate-500 max-w-[520px] mx-auto">
              See why scientists are choosing FigureReady over legacy tools for their publication figures.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {([
              {
                quote: "I used to spend hours reformatting XRD figures in OriginLab. With FigureReady, I get publication-ready output in minutes — no more fighting with axis settings or font sizes.",
                name: "Dr. Sarah M.",
                role: "Postdoc, Materials Science",
                institution: "ETH Zürich",
                from: "OriginLab",
              },
              {
                quote: "GraphPad Prism handles the stats well, but the figure quality never matched what journals expect. FigureReady gives me Nature-ready dose-response figures straight away.",
                name: "Thomas K.",
                role: "PhD candidate, Pharmacology",
                institution: "Université Paris Cité",
                from: "Prism GraphPad",
              },
              {
                quote: "OriginLab's learning curve was too steep for quick figures. FigureReady has FTIR and UV-Vis templates pre-configured exactly as I need them — I just import my data and export.",
                name: "Dr. Amina B.",
                role: "Researcher, Spectroscopy",
                institution: "CNRS",
                from: "OriginLab",
              },
              {
                quote: "I recommended FigureReady to my whole lab. No more inconsistent styling or wasted hours trying to make Prism figures look presentable for submission.",
                name: "Prof. J. Chen",
                role: "Principal Investigator",
                institution: "National University of Singapore",
                from: "Prism GraphPad",
              },
            ] as { quote: string; name: string; role: string; institution: string; from: string }[]).map((t, i) => (
              <div key={i} className="flex flex-col bg-white border border-slate-200 rounded-2xl p-7 gap-5 shadow-sm">
                <div className="flex gap-0.5">
                  {[0,1,2,3,4].map(s => (
                    <svg key={s} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed text-[15px] flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-semibold text-[#0f172a] text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.institution}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                    Previously: {t.from}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. UPLOAD ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 py-24 md:py-36">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Text left */}
            <div className="w-full md:w-[42%] order-2 md:order-1">
              <h2
                className="font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-[#0f172a] mb-5"
                style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
              >
                Start with your data
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-7 max-w-[420px]">
                Import your experimental data and turn raw columns into a clean scientific figure in
                seconds. Select the data you want to plot and let FigureReady handle the starting
                point.
              </p>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[15px] hover:text-blue-700 transition-colors"
              >
                Upload your data <ArrowRight />
              </Link>
            </div>

            {/* Image right */}
            <div className="w-full md:w-[58%] order-1 md:order-2">
              <Image
                src="/home-v2/upload.png"
                alt="Excel spreadsheet imported into FigureReady generating an XRD scientific figure"
                width={740}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TEMPLATES ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 py-24 md:py-36">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Image left */}
            <div className="w-full md:w-[55%]">
              <Image
                src="/home-v2/templates.png"
                alt="Scientific template cards — FTIR, XRD (Popular), Dose-Response"
                width={740}
                height={500}
                className="w-full h-auto"
              />
            </div>

            {/* Text right */}
            <div className="w-full md:w-[45%]">
              <h2
                className="font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-[#0f172a] mb-5"
                style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
              >
                Start from a scientific template, not a blank canvas
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-7 max-w-[420px]">
                Choose a figure designed for your experiment. FTIR, XRD, UV–Vis, photoluminescence,
                dose–response and more — with scientific defaults already in place.
              </p>
              <Link
                href="/templates"
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[15px] hover:text-blue-700 transition-colors"
              >
                Explore scientific templates <ArrowRight />
              </Link>
              <p className="text-sm text-slate-400 mt-3">More templates added regularly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. EDIT & ANNOTATE ───────────────────────────────────────── */}
      <section className="border-t border-slate-100 py-24 md:py-36">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Text left */}
            <div className="w-full md:w-[42%] order-2 md:order-1">
              <h2
                className="font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-[#0f172a] mb-5"
                style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
              >
                Refine every detail
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-7 max-w-[420px]">
                Adjust axes, labels, colors and series directly on your figure. Add peak labels,
                arrows, text and scientific annotations without switching to another application.
              </p>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[15px] hover:text-blue-700 transition-colors"
              >
                Explore the editor <ArrowRight />
              </Link>
            </div>

            {/* Image right */}
            <div className="w-full md:w-[58%] order-1 md:order-2">
              <Image
                src="/home-v2/edit-annotate.png"
                alt="FigureReady annotation toolbar with peak label on UV-Vis spectrum"
                width={740}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. EXPORT ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 py-24 md:py-36">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Image left */}
            <div className="w-full md:w-[55%]">
              <Image
                src="/home-v2/export.png"
                alt="XRD scientific figure exported to SVG, PDF and PNG"
                width={740}
                height={500}
                className="w-full h-auto"
              />
            </div>

            {/* Text right */}
            <div className="w-full md:w-[45%]">
              <h2
                className="font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-[#0f172a] mb-5"
                style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
              >
                Ready for wherever your science goes
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-4 max-w-[420px]">
                Finish your figure and export it in the format you need for your manuscript,
                presentation or supplementary material.
              </p>
              <p className="text-sm font-semibold text-slate-400 tracking-[0.14em] uppercase mb-8">
                SVG · PDF · PNG
              </p>
              <Link
                href="/app"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                Create your first figure
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PRICING ───────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── 7. FINAL CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#f0f7ff] py-24 md:py-28">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <h2
            className="font-bold text-[2rem] md:text-[2.5rem] leading-tight tracking-[-0.02em] text-[#0f172a] mb-4"
            style={{ fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}
          >
            Your data is ready.<br />Your figure should be too.
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-9">
            Create publication-ready scientific figures without rebuilding every plot from scratch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              href="/app"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl transition-colors shadow-sm"
            >
              Create a figure
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-semibold text-[15px] px-7 py-3.5 rounded-xl transition-colors"
            >
              Explore templates
            </Link>
          </div>
          <p className="text-sm text-slate-400">Start free · No installation required</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <LogoFull size={22} textSize={13} />
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <Link href="/templates" className="hover:text-slate-700 transition-colors">Templates</Link>
            <Link href="/pricing" className="hover:text-slate-700 transition-colors">Pricing</Link>
            <Link href="/roadmap" className="hover:text-slate-700 transition-colors">Roadmap</Link>
            <a href="mailto:hello@figureready.com" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-300">© 2025 FigureReady</p>
        </div>
      </footer>

    </div>
  )
}
