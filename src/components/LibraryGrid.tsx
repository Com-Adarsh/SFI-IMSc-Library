import React from 'react';
import Link from 'next/link';
import { SUBJECTS } from '@/lib/constants';

export default function LibraryGrid() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-navy mb-4">Professional Library</h2>
          <p className="text-slate-gray max-w-2xl mx-auto">
            Access verified question papers, textbooks, and study materials across 9 disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SUBJECTS.map((subject) => (
            <Link key={subject.name} href={`/subject/${subject.path}`}>
              <div className="group relative bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer">
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: subject.color }}
                />
                <div className="p-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {subject.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-navy mb-2 group-hover:text-crimson transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-slate-gray text-sm line-clamp-2 mb-4">
                    {subject.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-gray text-sm">Question Papers • Textbooks</span>
                    <span className="text-crimson group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-crimson">9+</div>
            <div className="text-slate-gray font-medium">Subjects</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-crimson">10</div>
            <div className="text-slate-gray font-medium">Semesters</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-crimson">1000+</div>
            <div className="text-slate-gray font-medium">Resources</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-crimson">24/7</div>
            <div className="text-slate-gray font-medium">Access</div>
          </div>
        </div>
      </div>
    </section>
  );
}
