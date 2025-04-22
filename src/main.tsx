import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { DEBUG_MODE_KEY } from './lib/storage-utils.ts'

// @ts-expect-error we declare a global functionw ithout typing that.
window.enableDebug = () => {
  localStorage.setItem(DEBUG_MODE_KEY, 'true')
  window.location.reload()
}

// @ts-expect-error we declare a global functionw ithout typing that.
window.disableDebug = () => {
  localStorage.removeItem(DEBUG_MODE_KEY)
  window.location.reload()
}

// Register service worker
registerSW()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
