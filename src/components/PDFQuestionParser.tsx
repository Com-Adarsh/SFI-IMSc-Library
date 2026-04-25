import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, Eye, Save } from 'lucide-react';
import { parsePDFToQuestions, ParsingResult, ExtractedQuestion } from '@/lib/pdf-parser';
import { validateQuestions, ParsedQuestion } from '@/lib/question-extractor';

interface PDFQuestionParserProps {
  onParsingComplete?: (result: ParsingResult, validatedQuestions: ParsedQuestion[]) => void;
  onCancel?: () => void;
  examCode?: string;
}

export default function PDFQuestionParser({ 
  onParsingComplete, 
  onCancel,
  examCode = 'NEW' 
}: PDFQuestionParserProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ParsingResult | null>(null);
  const [validatedQuestions, setValidatedQuestions] = useState<ParsedQuestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleParse = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setParsing(true);
    setProgress(0);
    setError(null);

    try {
      const parseResult = await parsePDFToQuestions(selectedFile, (p) => setProgress(p));
      
      if (parseResult.success) {
        // Convert to ParsedQuestion format for validation
        const validated = parseResult.questions.map((q: ExtractedQuestion, idx: number) => ({
          id: q.id,
          number: idx + 1,
          text: q.questionText,
          options: q.options,
          marks: 1,
          negativeMarks: 0,
          imageUrl: q.imageData,
        }));
        
        const validation = validateQuestions(validated);
        setValidatedQuestions(validation.valid);
        setResult(parseResult);
        
        if (validation.issues.length > 0) {
          setError(`${validation.issues.length} issues found. Please review the preview.`);
        }
      } else {
        setError(parseResult.errors.join(', ') || 'Failed to parse PDF');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during parsing');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    if (onParsingComplete && result && validatedQuestions.length > 0) {
      onParsingComplete(result, validatedQuestions);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-navy to-slate-800 text-white p-6">
        <div className="flex items-center gap-3">
          <FileText size={28} />
          <div>
            <h2 className="text-2xl font-bold">AI PDF Question Parser</h2>
            <p className="text-white/70 text-sm">Upload a question paper PDF to automatically convert it to a CBT mock test</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* File Upload Area */}
        {!result && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? 'border-crimson bg-crimson/5'
                : selectedFile
                ? 'border-emerald bg-emerald/5'
                : 'border-light-gray hover:border-crimson/50'
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-emerald" size={40} />
                  <div className="text-left">
                    <p className="font-medium text-slate-navy">{selectedFile.name}</p>
                    <p className="text-sm text-slate-gray">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-gray hover:text-crimson transition"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-slate-gray mb-4" size={48} />
                <p className="text-slate-navy font-medium mb-2">
                  Drag & drop your question paper PDF here
                </p>
                <p className="text-sm text-slate-gray mb-4">
                  Supports standard exam formats with numbered questions and A/B/C/D options
                </p>
                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <span className="bg-crimson text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition inline-block">
                    Browse Files
                  </span>
                </label>
              </>
            )}
          </div>
        )}

        {/* Parsing Progress */}
        {parsing && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-gray">Parsing PDF...</span>
              <span className="text-crimson font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-light-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-crimson transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-gray text-center">
              {progress < 30 && "Extracting text from PDF..."}
              {progress >= 30 && progress < 70 && "Identifying questions and options..."}
              {progress >= 70 && "Processing images and validating..."}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && !parsing && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Parsing Results Preview */}
        {result && !parsing && (
          <div className="mt-6 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{result.questions.length}</div>
                <div className="text-sm text-emerald-700">Questions Found</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.totalPages}</div>
                <div className="text-sm text-blue-700">Pages Processed</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{validatedQuestions.length}</div>
                <div className="text-sm text-purple-700">Valid Questions</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {result.questions.length - validatedQuestions.length}
                </div>
                <div className="text-sm text-amber-700">Needs Review</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 flex items-center justify-center gap-2 border border-crimson text-crimson px-6 py-3 rounded-lg font-medium hover:bg-crimson/10 transition"
              >
                <Eye size={18} />
                {showPreview ? 'Hide Preview' : 'Preview Questions'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={validatedQuestions.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-crimson text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                Confirm & Create Exam
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 rounded-lg border border-light-gray text-slate-gray hover:border-crimson hover:text-crimson transition"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Questions Preview Table */}
            {showPreview && (
              <div className="mt-6 border border-light-gray rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-light-gray">
                  <h3 className="font-semibold text-slate-navy">Extracted Questions Preview</h3>
                  <p className="text-sm text-slate-gray">Review and verify the extracted content</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-light-gray sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Question</th>
                        <th className="px-4 py-2 text-left">Options</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.questions.slice(0, 10).map((q, idx) => {
                        const isValid = validatedQuestions.some(vq => vq.id === q.id);
                        return (
                          <tr key={q.id} className="border-b border-light-gray hover:bg-ghost-white">
                            <td className="px-4 py-3 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 max-w-md">
                              <p className="line-clamp-2">{q.questionText.substring(0, 100)}...</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {q.options.slice(0, 2).map((opt, oi) => (
                                  <p key={oi} className="text-xs text-slate-gray line-clamp-1">
                                    {String.fromCharCode(65 + oi)}. {opt.substring(0, 40)}...
                                  </p>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isValid ? (
                                <CheckCircle size={16} className="text-emerald mx-auto" />
                              ) : (
                                <AlertCircle size={16} className="text-amber-500 mx-auto" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {result.questions.length > 10 && (
                    <div className="p-4 text-center text-slate-gray text-sm border-t border-light-gray">
                      + {result.questions.length - 10} more questions
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
