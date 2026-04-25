import React from 'react';
import Head from 'next/head';
import ModeratedUploadZone from '@/components/ModeratedUploadZone';
import Footer from '@/components/Footer';

export default function Upload() {
  return (
    <>
      <Head>
        <title>Upload Resources - Abhimanyu Learning Space</title>
        <meta name="description" content="Contribute to the IMSC community by sharing your study materials." />
      </Head>

      <main className="min-h-screen pt-20">
        <ModeratedUploadZone />
        <Footer />
      </main>
    </>
  );
}
