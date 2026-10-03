import { app } from './app'

const port = Number(process.env.BACKEND_PORT ?? 3001)

app.listen(port)

console.log(`[backend] listening on http://127.0.0.1:${port}`)

export type { App } from './app'
export default app
