import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'
import PricingSection from './PricingSection'

export const metadata: Metadata = {
  title: 'FigureReady — Turn scientific data into publication-ready figures',
  description:
    'Upload your Excel data, choose a scientific template, refine your figure, and export it for publication.',
  robots: { index: false },
}

function ArrowRight() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}


export default function HomeV2() {
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

      {/* ── 2. UPLOAD ────────────────────────────────────────────────── */}
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
