import React, { useState } from 'react';
import { CheckCircle, XCircle, Edit2, Save, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { ParsedQuestion } from '@/lib/question-extractor';

interface AdminQuestionPreviewProps {
  questions: ParsedQuestion[];
  examCode: string;
  examName: string;
  onConfirm: (questions: ParsedQuestion[], config: any) => void;
  onBack: () => void;
}

export default function AdminQuestionPreview({
  questions: initialQuestions,
  examCode,
  examName,
  onConfirm,
  onBack,
}: AdminQuestionPreviewProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<ParsedQuestion | null>(null);
  const [examConfig, setExamConfig] = useState({
    duration: 120,
    markingScheme: {
      correct: 3,
      incorrect: -1,
      unattempted: 0,
    },
    passingPercentage: 40,
  });

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...questions[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editData) {
      const updated = [...questions];
      updated[editingIndex] = editData;
      setQuestions(updated);
      setEditingIndex(null);
      setEditData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    if (editData) {
      const newOptions = [...editData.options];
      newOptions[optionIndex] = value;
      setEditData({ ...editData, options: newOptions });
    }
  };

  const handleCorrectAnswerChange = (letter: string) => {
    if (editData) {
      setEditData({ ...editData, correctAnswer: letter });
    }
  };

  const getStats = () => {
    const withAnswers = questions.filter(q => q.correctAnswer).length;
    const needsReview = questions.filter(q => !q.correctAnswer).length;
    return { withAnswers, needsReview, total: questions.length };
  };

  const stats = getStats();

  const handleFinalConfirm = () => {
    onConfirm(questions, examConfig);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-navy to-slate-800 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Verify Extracted Questions</h2>
            <p className="text-white/70 text-sm">
              Exam: {examName} ({examCode}) • {totalQuestions} questions
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              stats.withAnswers === stats.total ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              {stats.withAnswers}/{stats.total} Verified
            </span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Question Navigator */}
        <div className="w-72 border-r border-light-gray p-4 bg-ghost-white">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-navy mb-3">Exam Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-gray mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={examConfig.duration}
                  onChange={(e) => setExamConfig({ ...examConfig, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-gray mb-1">Correct Answer Marks</label>
                <input
                  type="number"
                  value={examConfig.markingScheme.correct}
                  onChange={(e) => setExamConfig({
                    ...examConfig,
                    markingScheme: { ...examConfig.markingScheme, correct: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-gray mb-1">Incorrect Answer Marks</label>
                <input
                  type="number"
                  value={examConfig.markingScheme.incorrect}
                  onChange={(e) => setExamConfig({
                    ...examConfig,
                    markingScheme: { ...examConfig.markingScheme, incorrect: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-slate-navy mb-3">Questions</h3>
            <div className="text-sm text-slate-gray mb-2">
              <span className="text-emerald-600">✓ {stats.withAnswers}</span> verified •
              <span className="text-amber-600 ml-2">⚠ {stats.needsReview}</span> need review
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentIndex === idx
                    ? 'bg-crimson text-white'
                    : q.correctAnswer
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {q.number}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Question Editor */}
        <div className="flex-1 p-6">
          {editingIndex !== null && editData ? (
            // Edit Mode
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-navy">Editing Question {editData.number}</h3>
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    <Save size={16} /> Save
                  </button>
                  <button onClick={handleCancelEdit} className="px-4 py-2 border border-light-gray rounded-lg hover:border-crimson">
                    Cancel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-navy font-medium mb-2">Question Text</label>
                <textarea
                  value={editData.text}
                  onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                />
              </div>

              <div>
                <label className="block text-slate-navy font-medium mb-2">Options</label>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-light-gray flex items-center justify-center font-bold">
                        {letter}
                      </span>
                      <input
                        type="text"
                        value={editData.options[idx] || ''}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                        placeholder={`Option ${letter}`}
                      />
                      <button
                        onClick={() => handleCorrectAnswerChange(letter)}
                        className={`p-2 rounded-full transition ${
                          editData.correctAnswer === letter
                            ? 'bg-emerald-500 text-white'
                            : 'bg-light-gray text-slate-gray hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-navy font-medium mb-2">Explanation (Optional)</label>
                <textarea
                  value={editData.explanation || ''}
                  onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson"
                  placeholder="Add an explanation for the correct answer..."
                />
              </div>
            </div>
          ) : (
            // View Mode - Current Question
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-gray">Question {currentIndex + 1} of {totalQuestions}</span>
                  {currentQuestion.correctAnswer ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm">
                      <CheckCircle size={14} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 text-sm">
                      <AlertTriangle size={14} /> Needs correct answer
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(currentIndex)}
                  className="flex items-center gap-2 text-crimson hover:bg-crimson/10 px-3 py-2 rounded-lg transition"
                >
                  <Edit2 size={16} /> Edit
                </button>
              </div>

              {/* Question Text */}
              <div className="bg-ghost-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-navy mb-4">
                  Q{currentQuestion.number}. {currentQuestion.text}
                </h3>
                
                {/* Options */}
                <div className="space-y-3 mt-6">
                  {currentQuestion.options.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect = currentQuestion.correctAnswer === letter;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-light-gray bg-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-light-gray text-slate-gray'
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1 text-slate-navy">{option}</span>
                        {isCorrect && (
                          <CheckCircle size={18} className="text-emerald-500" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-light-gray">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-light-gray rounded-lg hover:border-crimson transition disabled:opacity-50"
                >
                  <ArrowLeft size={18} /> Previous
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentIndex === totalQuestions - 1}
                  className="flex items-center gap-2 px-4 py-2 border border-light-gray rounded-lg hover:border-crimson transition disabled:opacity-50"
                >
                  Next <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-light-gray p-6 flex justify-between">
        <button onClick={onBack} className="px-6 py-2 border border-light-gray rounded-lg hover:border-crimson transition">
          Back
        </button>
        <button
          onClick={handleFinalConfirm}
          disabled={stats.withAnswers !== stats.total}
          className="bg-crimson text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Exam & Publish
        </button>
      </div>
    </div>
  );
}
