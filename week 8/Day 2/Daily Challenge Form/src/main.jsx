import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AutoCompletedText from './AutoCompletedText.jsx'
import './style.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main className="page">
      <header className="intro">
        <p className="eyebrow">React events · Daily challenge</p>
        <h1>Find a country</h1>
        <p>Type to search the countries list, then select a suggestion.</p>
      </header>
      <AutoCompletedText />
    </main>
  </StrictMode>,
)
