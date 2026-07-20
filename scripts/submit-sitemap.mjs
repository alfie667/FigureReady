/**
 * Submits figureready.com/sitemap.xml to Google Search Console.
 *
 * Requires env var:
 *   GOOGLE_SERVICE_ACCOUNT_JSON — the full JSON of a Google service account key
 *                                 that has been added as an Owner of the Search
 *                                 Console property https://figureready.com/
 *
 * Uses only Node.js built-ins (crypto, fetch). No npm install needed.
 * Requires Node >= 18.
 */

import { createSign } from 'crypto'

const SITE_URL    = 'https://figureready.com/'
const SITEMAP_URL = 'https://figureready.com/sitemap.xml'
const TOKEN_EP    = 'https://oauth2.googleapis.com/token'
const SCOPE       = 'https://www.googleapis.com/auth/webmasters'

// ── 1. Parse service account key ──────────────────────────────────────────────

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
if (!raw) {
  console.error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable.')
  process.exit(1)
}

let key
try {
  key = JSON.parse(raw)
} catch {
  console.error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.')
  process.exit(1)
}

// ── 2. Build & sign a JWT ─────────────────────────────────────────────────────

function b64url(s) {
  return Buffer.from(s).toString('base64url')
}

const now = Math.floor(Date.now() / 1000)
const header  = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
const payload = b64url(JSON.stringify({
  iss:   key.client_email,
  scope: SCOPE,
  aud:   TOKEN_EP,
  iat:   now,
  exp:   now + 3600,
}))

const sign = createSign('RSA-SHA256')
sign.update(`${header}.${payload}`)
const sig = b64url(sign.sign(key.private_key))
const jwt = `${header}.${payload}.${sig}`

// ── 3. Exchange JWT for an OAuth2 access token ────────────────────────────────

const tokenRes = await fetch(TOKEN_EP, {
  method:  'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body:    new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion:  jwt,
  }),
})

const tokenBody = await tokenRes.json()
if (!tokenBody.access_token) {
  console.error('Failed to get access token:', tokenBody)
  process.exit(1)
}

const { access_token } = tokenBody

// ── 4. Submit the sitemap via Search Console API ──────────────────────────────

const apiUrl = [
  'https://www.googleapis.com/webmasters/v3/sites',
  encodeURIComponent(SITE_URL),
  'sitemaps',
  encodeURIComponent(SITEMAP_URL),
].join('/')

const submitRes = await fetch(apiUrl, {
  method:  'PUT',
  headers: { Authorization: `Bearer ${access_token}` },
})

if (submitRes.ok || submitRes.status === 204) {
  console.log(`✓ Sitemap submitted: ${SITEMAP_URL}`)
} else {
  const body = await submitRes.text()
  console.error(`✗ Submission failed (HTTP ${submitRes.status}):`, body)
  process.exit(1)
}
