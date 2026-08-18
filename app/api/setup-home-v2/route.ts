import { NextResponse } from 'next/server'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const dest = join(process.cwd(), 'public', 'home-v2')
  mkdirSync(dest, { recursive: true })

  const downloads = 'C:\\Users\\zegga\\Downloads'
  const files: [string, string][] = [
    ['ChatGPT Image Aug 16, 2026, 03_13_59 PM.png', 'hero.png'],
    ['ChatGPT Image Aug 18, 2026, 02_27_32 PM.png', 'upload.png'],
    ['ChatGPT Image Aug 18, 2026, 02_34_19 PM.png', 'templates.png'],
    ['ChatGPT Image Aug 18, 2026, 02_31_59 PM.png', 'edit-annotate.png'],
    ['ChatGPT Image Aug 18, 2026, 02_35_24 PM.png', 'export.png'],
  ]

  const results: string[] = []
  for (const [src, out] of files) {
    const from = join(downloads, src)
    const to = join(dest, out)
    try {
      if (!existsSync(from)) {
        results.push(`✗ ${out} — source not found: ${from}`)
        continue
      }
      copyFileSync(from, to)
      results.push(`✓ ${out}`)
    } catch (e) {
      results.push(`✗ ${out} — ${e}`)
    }
  }

  return NextResponse.json({ dest, results })
}
