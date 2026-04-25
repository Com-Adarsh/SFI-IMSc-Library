import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      const { subject, semester, category, status = 'approved' } = req.query;
      
      let query = supabase.from('resources').select('*').eq('status', status);

      if (subject) query = query.eq('subject', subject);
      if (semester) query = query.eq('semester', parseInt(semester as string));
      if (category) query = query.eq('category', category);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ resources: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, subject, semester, category, file_url, file_size_mb, description, uploader_id, uploader_name, uploader_email } = req.body;

      const { data, error } = await supabase
        .from('resources')
        .insert([{
          title,
          subject,
          semester: parseInt(semester),
          category,
          file_url,
          file_size_mb: parseFloat(file_size_mb),
          description,
          uploader_id,
          uploader_name,
          uploader_email,
          status: 'pending',
          download_count: 0,
        }])
        .select();

      if (error) throw error;
      res.status(201).json({ resource: data?.[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
