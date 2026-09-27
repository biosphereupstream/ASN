import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { publicRoutes } from './routes/public'
import { adminRoutes } from './routes/admin'
import { seedDemoLeadsIfEmpty, seedIfEmpty } from './db/seed'

/**
 * Backend bootstrap (PRD §10): ElysiaJS on Bun.
 * The PGlite client applies migrations on import (src/db/client.ts), then the
 * demo seed runs before the server starts accepting requests (§10.4).
 */
await seedIfEmpty()
await seedDemoLeadsIfEmpty()

const port = Number(process.env.BACKEND_PORT ?? 3001)

const app = new Elysia()
  .use(cors())
  .get('/api/health', () => ({
    status: 'ok',
    service: 'asnnet-backend',
    time: new Date().toISOString()
  }))
  .use(publicRoutes)
  .use(adminRoutes)
  .listen(port)

console.log(`[backend] listening on http://127.0.0.1:${port}`)

export type App = typeof app
