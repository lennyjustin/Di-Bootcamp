import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Ninja from '../Ninja.jsx'
import './style.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Ninja />
  </StrictMode>,
)
