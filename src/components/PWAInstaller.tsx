"use client";

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator && (window as any).workbox === undefined) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('PWA ServiceWorker registered successfully:', registration.scope);
          },
          (err) => {
            console.log('PWA ServiceWorker registration failed:', err);
          }
        );
      });
    }
  }, []);

  return null;
}
