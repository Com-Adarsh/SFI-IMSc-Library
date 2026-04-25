import React, { useState, useEffect } from 'react';
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ParsedQuestion } from '@/lib/question-extractor';

interface CBTExamInterfaceProps {
  examId: string;
  examCode: string;
  examName: string;
  questions: ParsedQuestion[];
  duration: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  onSubmit: (answers: Record<string, string>, score: number) => void;
}

interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isFlagged: boolean;
}

export default function CBTExamInterface({
  examId,
  examCode,
  examName,
  questions,
  duration,
  markingScheme,
  onSubmit,
}: CBTExamInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = () => {
    if (!isSubmitted) {
      calculateAndSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        selectedOption: optionLetter,
      },
    }));
  };

  const handleFlag = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        selectedOption: prev[questionId]?.selectedOption || '',
        isFlagged: !prev[questionId]?.isFlagged,
      },
    }));
  };

  const calculateAndSubmit = () => {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer || !userAnswer.selectedOption) {
        unattempted++;
        score += markingScheme.unattempted;
      } else if (userAnswer.selectedOption === question.correctAnswer) {
        correct++;
        score += markingScheme.correct;
      } else {
        incorrect++;
        score += markingScheme.incorrect;
      }
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const result = {
      examId,
      examCode,
      score,
      correct,
      incorrect,
      unattempted,
      totalQuestions: questions.length,
      percentage: (score / (questions.length * markingScheme.correct)) * 100,
      timeTaken,
      answers,
    };

    onSubmit(answers, score);
    setShowResults(true);
    setIsSubmitted(true);
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const isFlagged = currentAnswer?.isFlagged || false;
  const answeredCount = Object.values(answers).filter(a => a.selectedOption).length;
  const flaggedCount = Object.values(answers).filter(a => a.isFlagged).length;

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">
            {score.percentage >= 70 ? '🎉' : score.percentage >= 40 ? '📚' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-slate-navy mb-2">Exam Completed!</h2>
          <p className="text-slate-gray mb-6">{examName} ({examCode})</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">{score.correct}</div>
              <div className="text-sm text-emerald-700">Correct</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{score.incorrect}</div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">{score.unattempted}</div>
              <div className="text-sm text-amber-700">Unattempted</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{score.total}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-4xl font-bold text-crimson mb-2">{score.score} / {score.maxScore}</div>
            <div className="text-slate-gray">Final Score ({score.percentage.toFixed(1)}%)</div>
            <div className="w-full bg-light-gray rounded-full h-2 mt-4">
              <div
                className="h-full bg-crimson rounded-full transition-all"
                style={{ width: `${Math.min(100, score.percentage)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Take Again
            </button>
            <button onClick={() => window.location.href = '/cbt'} className="btn-primary">
              Browse More Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let totalScore = 0;

    questions.forEach(question => {
      const answer = answers[question.id];
      if (!answer || !answer.selectedOption) {
        unattempted++;
      } else if (answer.selectedOption === question.correctAnswer) {
        correct++;
        totalScore += markingScheme.correct;
      } else {
        incorrect++;
        totalScore += markingScheme.incorrect;
      }
    });

    const maxScore = questions.length * markingScheme.correct;

    return {
      correct,
      incorrect,
      unattempted,
      total: questions.length,
      score: totalScore,
      maxScore,
      percentage: (totalScore / maxScore) * 100,
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Header with Timer */}
      <div className="bg-slate-navy text-white p-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold">{examName}</h2>
            <p className="text-white/70 text-sm">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
            <Clock size={18} />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-light-gray">
        <div
          className="h-full bg-crimson transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="p-8">
        {/* Flag Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleFlag(currentQuestion.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isFlagged
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-slate-gray hover:bg-light-gray'
            }`}
          >
            <Flag size={16} />
            {isFlagged ? 'Flagged for Review' : 'Flag Question'}
          </button>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-navy">
            Q{currentQuestion.number}. {currentQuestion.text}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {['A', 'B', 'C', 'D'].map((letter, idx) => {
            const optionText = currentQuestion.options[idx];
            if (!optionText) return null;
            
            const isSelected = currentAnswer?.selectedOption === letter;
            
            return (
              <button
                key={letter}
                onClick={() => handleAnswer(currentQuestion.id, letter)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-crimson bg-crimson/5 ring-2 ring-crimson/20'
                    : 'border-light-gray hover:border-crimson/50 hover:bg-ghost-white'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isSelected
                    ? 'bg-crimson text-white'
                    : 'bg-light-gray text-slate-gray'
                }`}>
                  {letter}
                </span>
                <span className="flex-1 text-slate-navy">{optionText}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-light-gray">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-gray text-slate-gray hover:border-crimson hover:text-crimson transition disabled:opacity-50"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          {currentIndex === questions.length - 1 ? (
            <button onClick={calculateAndSubmit} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson text-white hover:bg-red-700 transition"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-6 pt-6 border-t border-light-gray">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-slate-gray">Question Navigator:</p>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Answered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Flagged</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-light-gray rounded"></span> Unanswered</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const answer = answers[q.id];
              const isAnswered = answer && answer.selectedOption;
              const isQuestionFlagged = answer?.isFlagged;
              
              let bgColor = 'bg-light-gray';
              if (isAnswered) bgColor = 'bg-emerald-500 text-white';
              else if (isQuestionFlagged) bgColor = 'bg-yellow-500 text-white';
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    currentIndex === idx
                      ? 'ring-2 ring-crimson ring-offset-2'
                      : ''
                  } ${bgColor} ${
                    currentIndex !== idx && !isAnswered && !isQuestionFlagged
                      ? 'text-slate-gray'
                      : 'text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-slate-gray">
            Answered: {answeredCount} / {questions.length} • Flagged: {flaggedCount}
          </div>
        </div>
      </div>
    </div>
  );
}
