import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#2d004e',
            color: '#fff',
            border: '1px solid rgba(238,181,73,0.25)',
            fontFamily: '"Exo 2", sans-serif',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(45,0,78,0.45)',
          },
          success: { iconTheme: { primary: '#eeb549', secondary: '#2d004e' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#2d004e' } },
        }}/>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
