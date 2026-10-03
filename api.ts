import { app } from './backend/src/app'

export default {
  async fetch(request: Request): Promise<Response> {
    return app.fetch(request)
  }
}
