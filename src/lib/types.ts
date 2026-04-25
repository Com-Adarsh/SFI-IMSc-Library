export interface Resource {
  id: string;
  title: string;
  subject: string;
  semester: number;
  category: string;
  description?: string;
  file_url: string;
  file_size_mb: number;
  uploader_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  download_count: number;
  created_at: string;
}
