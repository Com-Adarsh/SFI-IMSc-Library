import React, { useState } from 'react';
import Head from 'next/head';
import CBTModule from '@/components/CBTModule';
import Footer from '@/components/Footer';
import { CBT_EXAMS } from '@/lib/constants';

export default function CBT() {
  const [selectedCode, setSelectedCode] = useState('101');

  return (
    <>
      <Head>
        <title>CBT Mock Tests - Abhimanyu Learning Space</title>
        <meta name="description" content="Practice with computer-based tests designed to simulate real exam conditions." />
      </Head>

      <main className="min-h-screen pt-20">
        <div className="bg-slate-navy text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-h1 mb-4">CBT Mock Test Portal</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Practice with computer-based tests designed to simulate real exam conditions
            </p>
          </div>
        </div>

        <section className="py-12 bg-ghost-white">
          <div className="container mx-auto px-4">
            {/* Exam Code Selector */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {CBT_EXAMS.map(exam => (
                <button
                  key={exam.code}
                  onClick={() => setSelectedCode(exam.code)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCode === exam.code
                      ? 'bg-crimson text-white shadow-lg'
                      : 'bg-white text-slate-navy border border-light-gray hover:border-crimson'
                  }`}
                >
                  {exam.code} - {exam.name}
                </button>
              ))}
            </div>

            {/* CBT Module */}
            <div className="max-w-4xl mx-auto">
              <CBTModule activeCode={selectedCode} />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
