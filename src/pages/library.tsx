import React from 'react';
import Head from 'next/head';
import LibraryGrid from '@/components/LibraryGrid';
import Footer from '@/components/Footer';

export default function Library() {
  return (
    <>
      <Head>
        <title>Professional Library - Abhimanyu Learning Space</title>
        <meta name="description" content="Access verified question papers, textbooks, and study materials across 9 disciplines." />
      </Head>

      <main className="min-h-screen pt-20">
        <div className="bg-slate-navy text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Library</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              9 disciplines, 10 semesters, 1000+ resources. All verified and organized for easy access.
            </p>
          </div>
        </div>

        <LibraryGrid />
        <Footer />
      </main>
    </>
  );
}
