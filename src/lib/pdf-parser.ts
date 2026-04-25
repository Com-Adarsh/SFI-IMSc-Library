import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ExtractedQuestion {
  id: string;
  questionNumber: string;
  questionText: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  pageNumber: number;
  hasImage: boolean;
  imageData?: string;
  rawText: string;
}

export interface ParsingResult {
  success: boolean;
  questions: ExtractedQuestion[];
  totalPages: number;
  errors: string[];
  metadata: {
    fileName: string;
    fileSize: number;
    parsedAt: string;
  };
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += `\n--- PAGE ${i} ---\n${pageText}\n`;
  }
  
  return fullText;
}

/**
 * Extract questions from PDF text using regex patterns
 */
export function extractQuestionsFromText(text: string, fileName: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];
  const lines = text.split('\n');
  
  // Question patterns (supports multiple formats)
  const questionPatterns = [
    /^(\d+)\.\s+(.+)$/gm,           // "1. Question text"
    /^Q\.?\s*(\d+)[\.\)]\s+(.+)$/gm, // "Q1. Question text" or "Q1) Question text"
    /^Question\s+(\d+)[:\.]\s+(.+)$/gm, // "Question 1: Question text"
    /^(\d+)\)\s+(.+)$/gm,            // "1) Question text"
  ];
  
  // Option patterns
  const optionPatterns = [
    /^([A-D])\.\s+(.+)$/gm,      // "A. Option text"
    /^([A-D])\)\s+(.+)$/gm,      // "A) Option text"
    /^\(([A-D])\)\s+(.+)$/gm,    // "(A) Option text"
  ];
  
  let currentQuestion: Partial<ExtractedQuestion> | null = null;
  let currentPage = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track page numbers
    if (line.includes('--- PAGE')) {
      const pageMatch = line.match(/--- PAGE (\d+) ---/);
      if (pageMatch) {
        currentPage = parseInt(pageMatch[1], 10);
      }
      continue;
    }
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if line starts a new question
    let isNewQuestion = false;
    let questionNumber = '';
    let questionText = '';
    
    for (const pattern of questionPatterns) {
      const match = pattern.exec(line);
      if (match) {
        isNewQuestion = true;
        questionNumber = match[1];
        questionText = match[2];
        break;
      }
    }
    
    if (isNewQuestion) {
      // Save previous question
      if (currentQuestion && currentQuestion.questionText) {
        questions.push({
          id: `q_${Date.now()}_${questions.length}`,
          questionNumber: currentQuestion.questionNumber || '',
          questionText: currentQuestion.questionText || '',
          options: currentQuestion.options || [],
          pageNumber: currentQuestion.pageNumber || currentPage,
          hasImage: false,
          rawText: currentQuestion.rawText || '',
        });
      }
      
      // Start new question
      currentQuestion = {
        questionNumber,
        questionText,
        options: [],
        pageNumber: currentPage,
        rawText: line,
      };
    } 
    // Check if line is an option for current question
    else if (currentQuestion) {
      let isOption = false;
      let optionLetter = '';
      let optionText = '';
      
      for (const pattern of optionPatterns) {
        const match = pattern.exec(line);
        if (match) {
          isOption = true;
          optionLetter = match[1];
          optionText = match[2];
          break;
        }
      }
      
      if (isOption && optionText) {
        currentQuestion.options?.push(optionText);
        currentQuestion.rawText += '\n' + line;
      } 
      // If not an option and not empty, append to question text
      else if (currentQuestion.questionText && !isOption && line.length > 10) {
        currentQuestion.questionText += ' ' + line;
        currentQuestion.rawText += '\n' + line;
      }
    }
  }
  
  // Add last question
  if (currentQuestion && currentQuestion.questionText) {
    questions.push({
      id: `q_${Date.now()}_${questions.length}`,
      questionNumber: currentQuestion.questionNumber || '',
      questionText: currentQuestion.questionText || '',
      options: currentQuestion.options || [],
      pageNumber: currentQuestion.pageNumber || currentPage,
      hasImage: false,
      rawText: currentQuestion.rawText || '',
    });
  }
  
  return questions;
}

/**
 * Extract images from PDF pages (for complex formulas/diagrams)
 * Note: This runs on client-side only
 */
export async function extractImagesFromPDF(file: File): Promise<Map<number, string>> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const imageMap = new Map<number, string>();
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
      canvasContext: context!,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    const imageData = canvas.toDataURL('image/png');
    imageMap.set(i, imageData);
  }
  
  return imageMap;
}

/**
 * Hybrid parser: extracts both text and images
 */
export async function parsePDFToQuestions(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsingResult> {
  const errors: string[] = [];
  
  try {
    // Step 1: Extract text
    onProgress?.(10);
    const text = await extractTextFromPDF(file);
    
    // Step 2: Extract questions from text
    onProgress?.(40);
    let questions = extractQuestionsFromText(text, file.name);
    
    // Step 3: Extract images for visual questions
    onProgress?.(70);
    let imageMap: Map<number, string> = new Map();
    try {
      imageMap = await extractImagesFromPDF(file);
    } catch (imgError) {
      console.warn('Image extraction failed, continuing with text only');
    }
    
    // Step 4: Match images to questions based on page number
    onProgress?.(85);
    questions = questions.map(q => ({
      ...q,
      hasImage: imageMap.has(q.pageNumber),
      imageData: imageMap.get(q.pageNumber),
    }));
    
    // Step 5: Validate questions
    const validQuestions = questions.filter(q => 
      q.questionText.length > 10 && q.options.length >= 2
    );
    
    const invalidCount = questions.length - validQuestions.length;
    if (invalidCount > 0) {
      errors.push(`${invalidCount} questions could not be parsed correctly`);
    }
    
    onProgress?.(100);
    
    return {
      success: validQuestions.length > 0,
      questions: validQuestions,
      totalPages: imageMap.size,
      errors,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        parsedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      questions: [],
      totalPages: 0,
      errors: [error.message || 'Failed to parse PDF'],
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        parsedAt: new Date().toISOString(),
      },
    };
  }
}
