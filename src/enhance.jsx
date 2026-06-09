import React from 'react';
import { createRoot } from 'react-dom/client';
import Hero from './components/Hero';
import ProductShop from './components/ProductShop';

function mountReactEnhancements() {
  window.YARNIT_REACT = true;

  const heroEl = document.getElementById('hero-root');
  const shopEl = document.getElementById('product-shop-root');

  if (heroEl) {
    createRoot(heroEl).render(
      <React.StrictMode>
        <Hero />
      </React.StrictMode>
    );
  }

  if (shopEl) {
    createRoot(shopEl).render(
      <React.StrictMode>
        <ProductShop />
      </React.StrictMode>
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactEnhancements);
} else {
  mountReactEnhancements();
}
