export interface ExamConfig {
  id: string;
  examCode: string;
  examName: string;
  duration: number;
  totalQuestions: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  questions: ParsedQuestion[];
  createdAt: string;
  isActive: boolean;
}

export interface ParsedQuestion {
  id: string;
  number: number;
  text: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  imageUrl?: string;
  marks: number;
  negativeMarks: number;
}

/**
 * Regex patterns for different question formats
 */
export const QUESTION_PATTERNS = {
  // Standard numbered questions: "1. ", "2. "
  STANDARD: /^(\d+)\.\s+(.+)$/gm,
  
  // Q number format: "Q1. ", "Q2. "
  Q_FORMAT: /^Q\.?\s*(\d+)[\.\)]\s+(.+)$/gm,
  
  // Parenthesis format: "1) ", "2) "
  PARENTHESIS: /^(\d+)\)\s+(.+)$/gm,
  
  // Word format: "Question 1: ", "Question 2: "
  WORD_FORMAT: /^Question\s+(\d+)[:\.]\s+(.+)$/gm,
};

export const OPTION_PATTERNS = {
  // Dot format: "A. ", "B. "
  DOT: /^([A-D])\.\s+(.+)$/gm,
  
  // Parenthesis format: "A) ", "B) "
  PARENTHESIS: /^([A-D])\)\s+(.+)$/gm,
  
  // Double parenthesis: "(A) ", "(B) "
  DOUBLE_PAREN: /^\(([A-D])\)\s+(.+)$/gm,
  
  // Lowercase: "a. ", "b. "
  LOWERCASE: /^([a-d])\.\s+(.+)$/gm,
};

/**
 * Auto-detect the question format used in the PDF
 */
export function detectQuestionFormat(text: string): string {
  const samples = text.slice(0, 5000);
  
  if (QUESTION_PATTERNS.Q_FORMAT.test(samples)) return 'Q_FORMAT';
  if (QUESTION_PATTERNS.PARENTHESIS.test(samples)) return 'PARENTHESIS';
  if (QUESTION_PATTERNS.WORD_FORMAT.test(samples)) return 'WORD_FORMAT';
  return 'STANDARD';
}

/**
 * Auto-detect the option format used
 */
export function detectOptionFormat(text: string): string {
  const samples = text.slice(0, 5000);
  
  if (OPTION_PATTERNS.DOUBLE_PAREN.test(samples)) return 'DOUBLE_PAREN';
  if (OPTION_PATTERNS.PARENTHESIS.test(samples)) return 'PARENTHESIS';
  if (OPTION_PATTERNS.LOWERCASE.test(samples)) return 'LOWERCASE';
  return 'DOT';
}

/**
 * Intelligent question extraction with format auto-detection
 */
export function intelligentExtractQuestions(
  text: string,
  config?: {
    questionPattern?: RegExp;
    optionPattern?: RegExp;
    startFrom?: number;
    endAt?: number;
  }
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionPattern = config?.questionPattern || QUESTION_PATTERNS.STANDARD;
  const optionPattern = config?.optionPattern || OPTION_PATTERNS.DOT;
  
  // Split text into sections (Assuming each question is separated by double newline or number)
  const sections = text.split(/\n\s*\n/);
  
  let questionNumber = config?.startFrom || 1;
  
  for (const section of sections) {
    const lines = section.split('\n');
    let questionText = '';
    const options: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check if this line contains a question number
      const questionMatch = questionPattern.exec(trimmed);
      if (questionMatch) {
        questionNumber = parseInt(questionMatch[1], 10);
        questionText = questionMatch[2];
        continue;
      }
      
      // Check if this line contains an option
      const optionMatch = optionPattern.exec(trimmed);
      if (optionMatch && options.length < 4) {
        options.push(optionMatch[2]);
        continue;
      }
      
      // If not a question or option, append to question text
      if (questionText && options.length === 0) {
        questionText += ' ' + trimmed;
      }
    }
    
    // Only add if we have both question text and at least 2 options
    if (questionText && options.length >= 2) {
      questions.push({
        id: `q_${Date.now()}_${questions.length}`,
        number: questionNumber,
        text: questionText,
        options: options.slice(0, 4), // Max 4 options
        marks: 1,
        negativeMarks: 0,
      });
      questionNumber++;
    }
  }
  
  return questions;
}

/**
 * Validate extracted questions for quality
 */
export function validateQuestions(questions: ParsedQuestion[]): {
  valid: ParsedQuestion[];
  invalid: ParsedQuestion[];
  issues: { questionId: string; issue: string }[];
} {
  const valid: ParsedQuestion[] = [];
  const invalid: ParsedQuestion[] = [];
  const issues: { questionId: string; issue: string }[] = [];
  
  for (const q of questions) {
    let isValid = true;
    
    if (!q.text || q.text.length < 10) {
      issues.push({ questionId: q.id, issue: 'Question text too short' });
      isValid = false;
    }
    
    if (q.options.length < 2) {
      issues.push({ questionId: q.id, issue: 'Insufficient options' });
      isValid = false;
    }
    
    for (const option of q.options) {
      if (option.length < 1) {
        issues.push({ questionId: q.id, issue: 'Empty option found' });
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      valid.push(q);
    } else {
      invalid.push(q);
    }
  }
  
  return { valid, invalid, issues };
}
