import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CBTExamInterface from '@/components/CBTExamInterface';
import { supabase } from '@/lib/supabase';
import { ParsedQuestion } from '@/lib/question-extractor';

export default function TakeExam() {
  const router = useRouter();
  const { examId } = router.query;
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const fetchExam = async () => {
    if (!supabase) {
      setError('Database not configured');
      setLoading(false);
      return;
    }

    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      setExam(examData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_number', { ascending: true });

      if (questionsError) throw questionsError;

      const formattedQuestions: ParsedQuestion[] = questionsData.map((q: any) => ({
        id: q.id,
        number: q.question_number,
        text: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        marks: q.marks,
        negativeMarks: q.negative_marks,
      }));

      setQuestions(formattedQuestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answers: Record<string, string>, score: number) => {
    // Save attempt to database (optional)
    if (supabase) {
      try {
        await supabase.from('exam_attempts').insert([{
          exam_id: examId,
          score,
          answers,
          completed_at: new Date().toISOString(),
        }]);
      } catch (err) {
        console.error('Failed to save attempt:', err);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson mx-auto mb-4"></div>
            <p className="text-slate-gray">Loading exam...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !exam) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Exam not found'}</p>
            <button onClick={() => router.push('/cbt')} className="btn-primary">
              Back to Tests
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{exam.exam_name} | Abhimanyu Learning Space</title>
      </Head>

      <Navigation />

      <main className="min-h-screen pt-24 pb-12 bg-ghost-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <CBTExamInterface
            examId={exam.id}
            examCode={exam.exam_code}
            examName={exam.exam_name}
            questions={questions}
            duration={exam.duration}
            markingScheme={exam.marking_scheme}
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
