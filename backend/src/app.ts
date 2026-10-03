import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { publicRoutes } from './routes/public'
import { adminRoutes } from './routes/admin'
import { seedDemoLeadsIfEmpty, seedIfEmpty } from './db/seed'

/**
 * Ensures database tables & initial seeds exist on startup.
 */
await seedIfEmpty()
await seedDemoLeadsIfEmpty()

export const app = new Elysia()
  .use(cors())
  .get('/api/health', () => ({
    status: 'ok',
    service: 'asnnet-backend',
    time: new Date().toISOString()
  }))
  .use(publicRoutes)
  .use(adminRoutes)

export type App = typeof app
