import { neon } from '@neondatabase/serverless'

// Server-only module — never imported in client components
export const sql = neon(process.env.DATABASE_URL!)
