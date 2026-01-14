import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server'
import { auth } from './lib/auth'

// Server-side URL localization/redirects for Paraglide
export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const start = Date.now()
    console.log(`[${req.method}] \x1b[36m->\x1b[0m ${url.pathname}`)

    const logResponse = (res: Response) => {
      const duration = Date.now() - start
      const color =
        res.status >= 500
          ? '\x1b[31m'
          : res.status >= 400
            ? '\x1b[33m'
            : '\x1b[32m'
      console.log(
        `[${req.method}] ${color}<- ${res.status}\x1b[0m ${url.pathname} (${duration}ms)`,
      )
      return res
    }

    try {
      // Handle auth routes
      if (url.pathname.startsWith('/api/auth')) {
        return auth.handler(req).then(logResponse)
      }

      return paraglideMiddleware(req, () => handler.fetch(req)).then(
        logResponse,
      )
    } catch (e) {
      console.error(`[${req.method}] \x1b[31mERROR\x1b[0m ${url.pathname}`, e)
      throw e
    }
  },
}
