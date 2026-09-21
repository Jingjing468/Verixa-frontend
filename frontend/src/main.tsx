import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App'

document.documentElement.style.colorScheme = 'light'
document.documentElement.removeAttribute('data-theme')
try { localStorage.removeItem('verixa_theme') } catch {}

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
