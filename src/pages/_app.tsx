import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Navigation from '@/components/Navigation';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navigation />
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
