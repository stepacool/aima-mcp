import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'


export function getContext() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error('Something went wrong', {
          description: error.message,
        })
      },
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error('Failed to load data', {
          description: error.message,
        })
      },
    }),
  })
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
