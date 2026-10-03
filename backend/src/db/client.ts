import path from 'node:path'
import { Pool } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { PGlite } from '@electric-sql/pglite'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL?.trim()

let dbInstance: any

if (databaseUrl) {
  const pool = new Pool({ connectionString: databaseUrl })
  dbInstance = drizzleNeon(pool, { schema })
} else {
  const client = new PGlite()
  dbInstance = drizzlePglite(client, { schema })
  await migrate(dbInstance, {
    migrationsFolder: path.join(import.meta.dir, '../../drizzle')
  })
}

export const db = dbInstance
