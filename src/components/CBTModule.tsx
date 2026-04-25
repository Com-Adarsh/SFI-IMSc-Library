import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { CBT_EXAMS } from '@/lib/constants';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

// Mock questions for demonstration
const MOCK_QUESTIONS: Record<string, Question[]> = {
  '101': [
    {
      id: 1,
      text: 'What is the fundamental principle of quantum mechanics that states particles exist in superposition until measured?',
      options: [
        'Pauli Exclusion Principle',
        'Uncertainty Principle',
        'Wave-Particle Duality',
        'Superposition Principle'
      ],
      correct: 3,
      explanation: 'The Superposition Principle states that quantum systems can exist in multiple states simultaneously until measurement collapses the wavefunction.'
    },
    {
      id: 2,
      text: 'Which of the following is NOT a valid data structure?',
      options: [
        'Array',
        'Stack',
        'Queue',
        'Transistor'
      ],
      correct: 3,
      explanation: 'Transistor is an electronic component, not a data structure. Arrays, Stacks, and Queues are fundamental data structures.'
    },
  ],
  '104': [
    {
      id: 1,
      text: 'The second law of thermodynamics states that entropy of an isolated system:',
      options: [
        'Always decreases',
        'Always remains constant',
        'Always increases',
        'May increase or decrease'
      ],
      correct: 2,
      explanation: 'The second law states that entropy of an isolated system always increases over time, approaching maximum at equilibrium.'
    },
  ],
};

interface CBTModuleProps {
  activeCode?: string;
}

export default function CBTModule({ activeCode = '101' }: CBTModuleProps) {
  const [selectedExam, setSelectedExam] = useState(activeCode);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const questions = MOCK_QUESTIONS[selectedExam] || MOCK_QUESTIONS['101'];
  const examConfig = CBT_EXAMS.find(e => e.code === selectedExam);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setTimeLeft(examConfig?.duration ? examConfig.duration * 60 : 7200);
  };

  const handleAnswer = (optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const handleFlag = () => {
    const newFlagged = new Set(flagged);
    if (flagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    Object.entries(answers).forEach(([qIndex, answer]) => {
      const question = questions[parseInt(qIndex)];
      if (question && answer === question.correct) {
        correct++;
      }
    });
    return {
      correct,
      incorrect: Object.keys(answers).length - correct,
      unattempted: questions.length - Object.keys(answers).length,
      percentage: (correct / questions.length) * 100,
    };
  };

  if (!examStarted) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">📝</div>
          <h2 className="text-2xl font-bold text-slate-navy mb-4">{examConfig?.name}</h2>
          <div className="bg-light-gray rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-slate-navy mb-3">Exam Instructions:</h3>
            <ul className="space-y-2 text-slate-gray">
              <li>• Duration: {examConfig?.duration} minutes</li>
              <li>• Total Questions: {examConfig?.totalQuestions || questions.length}</li>
              <li>• Each question carries 1 mark</li>
              <li>• No negative marking</li>
              <li>• You can flag questions for review</li>
            </ul>
          </div>
          <button onClick={handleStartExam} className="btn-primary">
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">
            {score.percentage >= 70 ? '🎉' : score.percentage >= 40 ? '📚' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-slate-navy mb-6">Exam Results</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">{score.correct}</div>
              <div className="text-sm text-emerald-700">Correct</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{score.incorrect}</div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-600">{score.unattempted}</div>
              <div className="text-sm text-slate-600">Unattempted</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-4xl font-bold text-crimson mb-2">{score.percentage.toFixed(1)}%</div>
            <div className="text-slate-gray">Overall Score</div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => {
              setExamStarted(false);
              setShowResults(false);
              setIsSubmitted(false);
              setAnswers({});
              setCurrentQuestion(0);
              setFlagged(new Set());
            }} className="btn-secondary">
              Take Another Test
            </button>
            <button onClick={() => window.location.href = '/library'} className="btn-primary">
              Browse Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-slate-navy text-white p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold">{examConfig?.name}</h2>
            <p className="text-white/70 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500/80' : 'bg-white/20'}`}>
            <Clock size={18} />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-light-gray">
        <div 
          className="h-full bg-crimson transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            {flagged.has(currentQuestion) && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Flag size={14} /> Flagged
              </span>
            )}
          </div>
          <button onClick={handleFlag} className={`p-2 rounded-lg transition ${flagged.has(currentQuestion) ? 'text-yellow-600 bg-yellow-100' : 'text-slate-gray hover:bg-light-gray'}`}>
            <Flag size={18} />
          </button>
        </div>

        <h3 className="text-xl font-semibold text-slate-navy mb-6">{question.text}</h3>

        <div className="space-y-3 mb-8">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                selectedAnswer === idx
                  ? 'border-crimson bg-crimson/5 ring-2 ring-crimson/20'
                  : 'border-light-gray hover:border-crimson/50 hover:bg-ghost-white'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedAnswer === idx
                  ? 'bg-crimson text-white'
                  : 'bg-light-gray text-slate-gray'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 text-slate-navy">{option}</span>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-light-gray">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-gray text-slate-gray hover:border-crimson hover:text-crimson transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button onClick={handleSubmit} className="btn-primary">
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson text-white hover:bg-red-700 transition"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-6 pt-6 border-t border-light-gray">
          <p className="text-sm text-slate-gray mb-3">Question Navigator:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentQuestion === idx
                    ? 'bg-crimson text-white'
                    : answers[idx] !== undefined
                    ? 'bg-emerald-100 text-emerald-700'
                    : flagged.has(idx)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-light-gray text-slate-gray hover:bg-crimson/20'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-sm text-slate-gray">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-100 rounded"></span> Answered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded"></span> Flagged</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-light-gray rounded"></span> Unattempted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
