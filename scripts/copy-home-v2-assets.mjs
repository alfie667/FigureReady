import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dest = join(__dirname, '..', 'public', 'home-v2')

mkdirSync(dest, { recursive: true })

const files = [
  ['ChatGPT Image Aug 16, 2026, 03_13_59 PM.png', 'hero.png'],
  ['ChatGPT Image Aug 18, 2026, 02_27_32 PM.png', 'upload.png'],
  ['ChatGPT Image Aug 18, 2026, 02_34_19 PM.png', 'templates.png'],
  ['ChatGPT Image Aug 18, 2026, 02_31_59 PM.png', 'edit-annotate.png'],
  ['ChatGPT Image Aug 18, 2026, 02_35_24 PM.png', 'export.png'],
]

const downloads = 'C:\\Users\\zegga\\Downloads'

for (const [src, out] of files) {
  const from = join(downloads, src)
  const to = join(dest, out)
  copyFileSync(from, to)
  console.log(`✓ ${out}`)
}

console.log('\nDone — public/home-v2/ ready.')
