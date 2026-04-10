/** @author Harry Vasanth (harryvasanth.com) */
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { DarkModeProvider } from './contexts/DarkModeProvider'
import { I18nProvider } from './contexts/I18nProvider'
import './index.css'
import { toast } from './lib/toast'

const queryClient = new QueryClient({
  // Global cache observer to catch background sync failures
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toasts if the user is online.
      // If they are offline, the NetworkMonitor handles the warning.
      if (navigator.onLine) {
        // We now use the error object here, satisfying TypeScript and improving the toast!
        toast.error(`Sync failed: ${query.queryKey[0]} (${error.message})`)
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
