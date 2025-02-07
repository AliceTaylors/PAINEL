import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';
import '../styles/painel.css';
import '../styles/home.css';
import '../styles/docs.css';
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
