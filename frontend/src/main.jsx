import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-center" toastOptions={{
          style: { background:'#3D2B1F', color:'#F5EDD8', border:'1px solid rgba(201,168,76,0.3)', fontFamily:'Raleway,sans-serif' },
          success: { iconTheme: { primary:'#C9A84C', secondary:'#3D2B1F' } }
        }}/>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
