import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
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
    
    if (!formData.title || !formData.subject || !formData.semester || !formData.category || !formData.file) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Uploading to moderation queue...' });
    setUploadProgress(0);

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setStatus({
        type: 'success',
        message: 'Resource submitted successfully! Our team will review and publish it shortly.',
      });
      
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
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setStatus({ type: 'error', message: 'Upload failed. Please try again.' });
      setUploadProgress(0);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-navy to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contribute to the Library</h2>
            <p className="text-white/80">
              Share your study materials with the IMSC community. All submissions are reviewed before publication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="space-y-6">
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

              <div>
                <label className="block text-slate-navy font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Add any relevant details about this resource..."
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:border-crimson transition"
                />
              </div>

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
                      <p className="text
