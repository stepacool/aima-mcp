import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server'
import { auth } from './lib/auth'

// Server-side URL localization/redirects for Paraglide
export default {
  async fetch(req: Request): Promise<Response> {
    // Handle auth routes
    const url = new URL(req.url)
    if (url.pathname.startsWith('/api/auth')) {
      return auth.handler(req)
    }
    
    return paraglideMiddleware(req, () => handler.fetch(req))
  },
}
