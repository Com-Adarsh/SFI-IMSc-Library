export const SUBJECTS = [
  { 
    name: 'Physics', 
    icon: '⚛️', 
    color: '#2563EB', 
    path: 'physics',
    description: 'Classical & Quantum Mechanics, Thermodynamics, Electromagnetism'
  },
  { 
    name: 'Chemistry', 
    icon: '🧪', 
    color: '#D70A0A', 
    path: 'chemistry',
    description: 'Organic, Inorganic, Physical Chemistry'
  },
  { 
    name: 'Mathematics', 
    icon: '📐', 
    color: '#0A192F', 
    path: 'mathematics',
    description: 'Calculus, Algebra, Differential Equations'
  },
  { 
    name: 'Statistics', 
    icon: '📊', 
    color: '#00C853', 
    path: 'statistics',
    description: 'Probability, Statistical Inference, Data Analysis'
  },
  { 
    name: 'Biology', 
    icon: '🧬', 
    color: '#7C3AED', 
    path: 'biology',
    description: 'Molecular Biology, Genetics, Ecology'
  },
  { 
    name: 'Environmental Science', 
    icon: '🌿', 
    color: '#16A34A', 
    path: 'environmental-science',
    description: 'Ecology, Climate Change, Sustainability'
  },
  { 
    name: 'Econometrics', 
    icon: '📈', 
    color: '#2563EB', 
    path: 'econometrics',
    description: 'Economic Models, Data Analysis, Forecasting'
  },
  { 
    name: 'Photonics', 
    icon: '🔆', 
    color: '#F59E0B', 
    path: 'photonics',
    description: 'Optics, Lasers, Light Technology'
  },
  { 
    name: 'Electives', 
    icon: '📖', 
    color: '#64748B', 
    path: 'electives',
    description: 'Specialized Topics & Interdisciplinary Studies'
  },
];

export const SEMESTERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Semester ${i + 1}`,
  type: (i + 1) % 2 === 0 ? 'Even' : 'Odd',
}));

export const CATEGORIES = [
  { value: 'question_paper', label: 'Question Paper', icon: '📄' },
  { value: 'textbook', label: 'Textbook', icon: '📚' },
  { value: 'student_notes', label: 'Student Notes', icon: '📝' },
];

export const APP_NAME = 'Abhimanyu Learning Space';
export const CONTACT_EMAIL = 'sfiimscsubcommittee25@gmail.com';
export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaesYjiHgZWZT1NwWo1z';
export const INSTAGRAM_URL = 'https://www.instagram.com/sfi_imsc_subcommittee_cusat';
