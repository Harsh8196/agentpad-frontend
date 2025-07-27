'use client';

import { useEffect, useState } from 'react';

interface HydrationSuppressorProps {
  children: React.ReactNode;
}

export default function HydrationSuppressor({ children }: HydrationSuppressorProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Suppress hydration warnings for browser extension attributes
  useEffect(() => {
    const suppressHydrationWarning = () => {
      const elements = document.querySelectorAll('[data-new-gr-c-s-check-loaded], [data-gr-ext-installed]');
      elements.forEach(element => {
        element.removeAttribute('data-new-gr-c-s-check-loaded');
        element.removeAttribute('data-gr-ext-installed');
      });
    };

    // Run after hydration
    if (isHydrated) {
      suppressHydrationWarning();
    }
  }, [isHydrated]);

  return <>{children}</>;
} 