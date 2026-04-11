import React from 'react';
import { createRoot } from 'react-dom/client';

import { initThemeOnDom } from '@/lib/theme-init';

import { App } from './app';
import './index.css';

initThemeOnDom();

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
