import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PDFQuestionParser from '@/components/PDFQuestionParser';
import AdminQuestionPreview from '@/components/AdminQuestionPreview';
import { ParsingResult } from '@/lib/pdf-parser';
import { ParsedQuestion } from '@/lib/question-extractor';

export default function AdminParsePDF() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [parsingResult, setParsingResult] = useState<ParsingResult | null>(null);
  const [examCode, setExamCode] = useState('');
  const [examName, setExamName] = useState('');

  const handleParsingComplete = (result: ParsingResult, questions: ParsedQuestion[]) => {
    setParsingResult(result);
    setParsedQuestions(questions);
    setStep('preview');
  };

  const handleConfirmExam = async (questions: ParsedQuestion[], config: any) => {
    // Save to database
    try {
      const response = await fetch('/api/save-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examCode: examCode || 'CAT-2026',
          examName: examName || `Mock Test ${new Date().toLocaleDateString()}`,
          questions,
          config,
          metadata: parsingResult?.metadata,
        }),
      });

      if (response.ok) {
        router.push('/cbt');
      } else {
        alert('Failed to save exam');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error saving exam');
    }
  };

  return (
    <>
      <Head>
        <title>Admin - Parse PDF to CBT | Abhimanyu Learning Space</title>
      </Head>

      <Navigation />

      <main className="min-h-screen pt-24 pb-12 bg-ghost-white">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === 'upload' ? 'bg-crimson text-white' : 'bg-emerald-500 text-white'
              }`}>
                1
              </div>
              <div className={`w-16 h-0.5 ${step === 'preview' ? 'bg-emerald-500' : 'bg-light-gray'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === 'preview' ? 'bg-crimson text-white' : 'bg-light-gray text-slate-gray'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Exam Details Form (shown in upload step) */}
          {step === 'upload' && (
            <div className="mb-6 bg-white rounded-xl p-6 shadow-card">
              <h3 className="text-lg font-semibold text-slate-navy mb-4">Exam Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-gray mb-1">Exam Code</label>
                  <input
                    type="text"
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    placeholder="e.g., CAT-2026-101"
                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-gray mb-1">Exam Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g., CUSAT CAT 2026 Mock Test"
                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: PDF Upload & Parsing */}
          {step === 'upload' && (
            <PDFQuestionParser
              onParsingComplete={handleParsingComplete}
              examCode={examCode || 'NEW'}
            />
          )}

          {/* Step 2: Question Verification */}
          {step === 'preview' && (
            <AdminQuestionPreview
              questions={parsedQuestions}
              examCode={examCode || 'CAT-2026'}
              examName={examName || 'Mock Test'}
              onConfirm={handleConfirmExam}
              onBack={() => setStep('upload')}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
