import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const { examCode, examName, questions, config, metadata } = req.body;

    // Validate input
    if (!examCode || !questions || !questions.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save exam metadata
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert([{
        exam_code: examCode,
        exam_name: examName,
        duration: config.duration,
        total_questions: questions.length,
        marking_scheme: config.markingScheme,
        passing_percentage: config.passingPercentage,
        is_active: true,
        metadata,
      }])
      .select()
      .single();

    if (examError) throw examError;

    // Save questions
    const questionsToInsert = questions.map((q: any, idx: number) => ({
      exam_id: exam.id,
      question_number: idx + 1,
      question_text: q.text,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_answer: q.correctAnswer,
      explanation: q.explanation || null,
      marks: config.markingScheme.correct,
      negative_marks: config.markingScheme.incorrect,
    }));

    const { error: questionsError } = await supabase
      .from('exam_questions')
      .insert(questionsToInsert);

    if (questionsError) throw questionsError;

    res.status(201).json({ success: true, examId: exam.id });
  } catch (error: any) {
    console.error('Error saving exam:', error);
    res.status(500).json({ error: error.message });
  }
}
