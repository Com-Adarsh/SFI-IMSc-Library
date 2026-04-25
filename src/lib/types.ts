export interface Resource {
  id: string;
  title: string;
  subject: string;
  semester: number;
  category: string;
  description?: string;
  file_url: string;
  file_size_mb: number;
  uploader_id: string;
  uploader_name?: string;
  uploader_email?: string;
  status: 'pending' | 'approved' | 'rejected';
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface CBTQuestion {
  id: string;
  exam_code: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  marks: number;
  negative_marks: number;
}

export interface CBTAttempt {
  id: string;
  user_id: string;
  exam_code: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  time_taken: number;
  answers: Record<string, string>;
  completed_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'contributor' | 'moderator' | 'admin';
  avatar_url?: string;
  contribution_count: number;
  created_at: string;
}
