/**
 * @author Ananthapadmanabhan V K
 * Main entry point for the application
 * This file is the entry point for the application
 * @returns ReactDOM.createRoot with App component
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18n
import './App.scss';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
