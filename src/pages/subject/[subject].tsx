import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Download, FileText, Clock, User, Filter, ChevronDown } from 'lucide-react';
import { SUBJECTS, SEMESTERS, CATEGORIES } from '@/lib/constants';
import Footer from '@/components/Footer';

export default function SubjectPage() {
  const router = useRouter();
  const { subject: subjectPath } = router.query;
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const subject = SUBJECTS.find(s => s.path === subjectPath);

  if (!subject) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-navy mb-4">Subject Not Found</h1>
          <Link href="/library" className="text-crimson hover:underline">Return to Library</Link>
        </div>
      </div>
    );
  }

  const filteredSemesters = selectedCategory === 'all' 
    ? SEMESTERS 
    : SEMESTERS.filter(s => s.type === (selectedCategory === 'odd' ? 'Odd' : 'Even'));

  return (
    <>
      <Head>
        <title>{subject.name} - Abhimanyu Learning Space</title>
      </Head>

      <main className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-navy to-slate-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{subject.icon}</span>
              <div>
                <h1 className="text-h1">{subject.name}</h1>
                <p className="text-lg opacity-90 mt-2">{subject.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-light-gray py-4 sticky top-20 z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-4">
              <Filter size={20} className="text-slate-gray" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-crimson text-white'
                    : 'hover:bg-light-gray'
                }`}
              >
                All Semesters
              </button>
              <button
                onClick={() => setSelectedCategory('odd')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === 'odd'
                    ? 'bg-crimson text-white'
                    : 'hover:bg-light-gray'
                }`}
              >
                Odd Semesters (1,3,5,7,9)
              </button>
              <button
                onClick={() => setSelectedCategory('even')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === 'even'
                    ? 'bg-crimson text-white'
                    : 'hover:bg-light-gray'
                }`}
              >
                Even Semesters (2,4,6,8,10)
              </button>
            </div>
          </div>
        </div>

        {/* Semester Grid */}
        <section className="py-12 bg-ghost-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSemesters.map((semester) => (
                <div key={semester.id} className="card cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-crimson/10 flex items-center justify-center group-hover:bg-crimson transition">
                      <FileText className="text-crimson group-hover:text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-navy">{semester.name}</h3>
                      <p className="text-slate-gray text-sm">{semester.type} Semester</p>
                    </div>
                  </div>
                  <p className="text-slate-gray text-sm mb-4">
                    Access question papers, textbooks, and notes for {semester.name}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-gray">📄 Resources available</span>
                    <span className="text-crimson group-hover:translate-x-1 transition">Browse →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Message */}
            <div className="mt-12 text-center p-8 bg-white rounded-xl border border-light-gray">
              <p className="text-slate-gray">
                📚 More resources are being added regularly. 
                <Link href="/upload" className="text-crimson font-medium hover:underline ml-1">
                  Contribute to the library →
                </Link>
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
