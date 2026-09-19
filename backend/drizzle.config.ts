import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Kit config. In dev the backend runs on in-process Postgres (PGlite,
 * see src/db/client.ts) which seeds itself; this config targets a real
 * PostgreSQL for `drizzle-kit generate` migrations (PRD §10.2/§12) once
 * DATABASE_URL points at the production database.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/asnnet'
  }
})
