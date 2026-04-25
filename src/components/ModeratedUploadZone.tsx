import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { SUBJECTS, SEMESTERS, CATEGORIES } from '@/lib/constants';

interface UploadFormData {
  title: string;
  subject: string;
  semester: string;
  category: string;
  description: string;
  uploaderName: string;
  uploaderEmail: string;
  file: File | null;
}

export default function ModeratedUploadZone() {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    subject: '',
    semester: '',
    category: '',
    description: '',
    uploaderName: '',
    uploaderEmail: '',
    file: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

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
      if (file.size <= 50 * 1024 * 1024) {
        setFormData(prev => ({ ...prev, file }));
        setStatus({ type: 'idle', message: '' });
      } else {
        setStatus({ type: 'error', message: 'File size exceeds 50MB limit.' });
      }
    } else {
      setStatus({ type: 'error', message: 'Only PDF files are accepted.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.subject || !formData.semester || !formData.category || !formData.file) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Uploading to moderation queue...' });
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // In production: Upload to Supabase storage and create pending record
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setStatus({
        type: 'success',
        message: 'Resource submitted successfully! Our team will review and publish it shortly. You will receive a confirmation email.',
      });
      
      // Reset form
      setFormData({
        title: '',
        subject: '',
        semester: '',
        category: '',
        description: '',
        uploaderName: '',
        uploaderEmail: '',
        file: null,
      });
    } catch (error) {
      clearInterval(interval);
      setStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-navy to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-h2 text-white mb-4">Contribute to the Library</h2>
            <p className="text-white/80">
              Share your study materials with the IMSC community. All submissions are reviewed by moderators before publication.
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-slate-navy font-medium mb-2">
                  Document Title <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Mid-Semester Physics Exam 2024"
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                  required
                />
              </div>

              {/* Subject and Semester */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-navy font-medium mb-2">
                    Subject <span className="text-crimson">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                    required
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map(subject => (
                      <option key={subject.name} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-navy font-medium mb-2">
                    Semester <span className="text-crimson">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                    required
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-navy font-medium mb-2">
                  Resource Type <span className="text-crimson">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.category === cat.value
                          ? 'border-crimson bg-crimson/5 text-crimson'
                          : 'border-light-gray text-slate-gray hover:border-crimson/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{cat.icon}</span>
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-navy font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Add any relevant details about this resource..."
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                />
              </div>

              {/* Uploader Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-navy font-medium mb-2">
                    Your Name <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.uploaderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, uploaderName: e.target.value }))}
                    className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-navy font-medium mb-2">
                    Your Email <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.uploaderEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, uploaderEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                    required
                  />
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-slate-navy font-medium mb-2">
                  PDF File <span className="text-crimson">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                      ? 'border-crimson bg-crimson/5'
                      : formData.file
                      ? 'border-emerald bg-emerald/5'
                      : 'border-light-gray hover:border-crimson/50'
                  }`}
                >
                  {formData.file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-emerald" size={32} />
                        <div className="text-left">
                          <p className="font-medium text-slate-navy">{formData.file.name}</p>
                          <p className="text-sm text-slate-gray">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                        className="p-2 hover:bg-light-gray rounded-full transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-gray mb-4" size={48} />
                      <p className="text-slate-navy font-medium mb-2">
                        Drag & drop your PDF here, or click to browse
                      </p>
                      <p className="text-sm text-slate-gray mb-4">
                        Maximum file size: 50 MB
                      </p>
                      <label className="inline-block cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                        <span className="btn-primary inline-block">
                          Browse Files
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                    <div
                      className="h-full bg-crimson transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-gray text-center">{uploadProgress}% uploaded</p>
                </div>
              )}

              {/* Status Message */}
              <AnimatePresence>
                {status.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      status.type === 'success'
                        ? 'bg-emerald/10 text-emerald border border-emerald/30'
                        : status.type === 'error'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                    }`}
                  >
                    {status.type === 'success' && <CheckCircle size={20} />}
                    {status.type === 'error' && <AlertCircle size={20} />}
                    {status.type === 'loading' && <Loader className="animate-spin" size={20} />}
                    <span>{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.type === 'loading' ? 'Submitting...' : 'Submit for Review'}
              </button>

              {/* Info Note */}
              <div className="text-center text-sm text-slate-gray">
                <p>All submissions are reviewed by the SFI IMSC Sub-Committee before publication.</p>
                <p className="mt-1">You will receive a confirmation email once your resource is approved.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
