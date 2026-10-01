import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useStore } from './store/progress'

const themeParam = new URLSearchParams(location.search).get('theme')
if (themeParam === 'light' || themeParam === 'dark') useStore.getState().setSettings({ theme: themeParam })
document.documentElement.classList.toggle('dark', useStore.getState().settings.theme === 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
