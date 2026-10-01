import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './Daily challenge.jsx';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './style.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
