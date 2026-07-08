import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './store'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ConfirmProvider } from './components/Confirm'
import { installGlobalErrorCapture } from './lib/telemetry'

installGlobalErrorCapture()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <StoreProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </StoreProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
)
