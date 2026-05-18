import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import GuestPortal from './features/events/GuestPortal.jsx';
import './style.css';

const portalMatch = window.location.pathname.match(/^\/event\/([^/]+)\/guest$/)
const rootEl = document.getElementById('root')

if (portalMatch) {
  createRoot(rootEl).render(<GuestPortal token={portalMatch[1]} />)
} else {
  createRoot(rootEl).render(<App />)
}
