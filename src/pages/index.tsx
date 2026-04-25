import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LibraryGrid from '@/components/LibraryGrid';
import CBTModule from '@/components/CBTModule';
import ModeratedUploadZone from '@/components/ModeratedUploadZone';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Abhimanyu Learning Space - Professional Library & CBT Mock Tests</title>
        <meta name="description" content="A focused academic environment for CUSAT students featuring Professional Library and CBT Mock Test System." />
      </Head>

      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section 
          className="relative h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(10, 25, 47, 0.85), rgba(215, 10, 10, 0.4)), url('https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center gap-6 mb-6">
                <img src="/cusat-logo.svg" alt="CUSAT" className="h-16 w-auto" />
                <img src="/abhimanyu-logo.svg" alt="Abhimanyu" className="h-16 w-auto" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                ABHIMANYU <span className="text-crimson">LEARNING SPACE</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-2 font-medium">
                Knowledge is a Weapon, Education is Liberation.
              </p>
              
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                A focused academic environment featuring Professional Library and CBT Mock Test System for CUSAT students.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/library">
                  <button className="bg-crimson text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition transform hover:scale-105">
                    📚 Browse Library
                  </button>
                </Link>
                <Link href="/cbt">
                  <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-slate-navy transition transform hover:scale-105">
                    💻 CBT Mock Tests
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Library Section */}
        <LibraryGrid />

        {/* CBT Preview Section */}
        <section className="py-16 bg-ghost-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-h2 text-slate-navy mb-4">CBT Mock Test Portal</h2>
              <p className="text-slate-gray max-w-2xl mx-auto">
                Practice with computer-based tests designed to simulate real exam conditions
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <CBTModule activeCode="101" />
            </div>
            <div className="text-center mt-8">
              <Link href="/cbt">
                <button className="btn-secondary">View All Test Codes →</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <ModeratedUploadZone />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
