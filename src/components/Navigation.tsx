import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Upload, BookOpen, Computer, Mail } from 'lucide-react';
import { SUBJECTS } from '@/lib/constants';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 shadow-lg border-b border-light-gray'
          : 'bg-white/80 backdrop-blur-md border-b border-light-gray/50'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex gap-2">
              <img src="/cusat-logo.svg" alt="CUSAT" className="h-12 w-auto" />
              <img src="/abhimanyu-logo.svg" alt="Abhimanyu" className="h-12 w-auto" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-slate-navy">
                ABHIMANYU <span className="text-crimson">LEARNING SPACE</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-gray">
                Knowledge is a Weapon, Education is Liberation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative group">
              <button className="flex items-center gap-1 text-slate-navy font-medium hover:text-crimson transition">
                <BookOpen size={16} />
                Library
                <ChevronDown size={14} />
              </button>
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-light-gray opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {SUBJECTS.map((subject) => (
                  <Link
                    key={subject.name}
                    href={`/subject/${subject.path}`}
                    className="flex items-center gap-3 px-4 py-3 text-slate-navy hover:bg-ghost-white hover:text-crimson transition-colors"
                  >
                    <span className="text-xl">{subject.icon}</span>
                    <div>
                      <div className="font-medium">{subject.name}</div>
                      <div className="text-xs text-slate-gray">{subject.description.slice(0, 40)}...</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/cbt" className="flex items-center gap-2 text-slate-navy font-medium hover:text-crimson transition">
              <Computer size={16} />
              CBT Mock Tests
            </Link>

            <Link href="/upload" className="flex items-center gap-2 bg-crimson text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition">
              <Upload size={16} />
              Upload Resource
            </Link>

            <a
              href="mailto:sfiimscsubcommittee25@gmail.com"
              className="flex items-center gap-2 text-slate-gray hover:text-crimson transition"
            >
              <Mail size={16} />
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-light-gray transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-light-gray">
            <div className="space-y-3">
              <p className="font-semibold text-slate-navy px-3 py-2">Library by Subject</p>
              {SUBJECTS.map((subject) => (
                <Link
                  key={subject.name}
                  href={`/subject/${subject.path}`}
                  className="flex items-center gap-3 px-6 py-2 text-slate-gray hover:text-crimson transition"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                </Link>
              ))}
              <div className="border-t border-light-gray my-2"></div>
              <Link
                href="/cbt"
                className="block px-3 py-2 text-slate-navy font-medium hover:text-crimson transition"
                onClick={() => setIsOpen(false)}
              >
                CBT Mock Tests
              </Link>
              <Link
                href="/upload"
                className="block px-3 py-2 text-crimson font-medium hover:bg-crimson/10 rounded-lg transition"
                onClick={() => setIsOpen(false)}
              >
                Upload Resource
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
