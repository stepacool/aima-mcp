import { useRouter } from '@tanstack/react-router'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function DefaultErrorComponent({ error }: { error: Error }) {
  const router = useRouter()

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 p-4">
      <div className="flex max-w-md flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={() => {
            router.invalidate()
          }}
          className="mt-4 flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700/50"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
