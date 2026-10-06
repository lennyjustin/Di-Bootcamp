import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Project from '../project.jsx'
import './style.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Project />
  </StrictMode>,
)
