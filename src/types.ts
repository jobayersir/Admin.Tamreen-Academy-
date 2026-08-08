/**
 * Tamreen Academy (তামরীন একাডেমি) Admin Panel Data Types
 * NTRCA Arabic Cadre, Lecturer, & Assistant Teacher Prep Platform
 */

export type Subject = 
  | 'আল-কুরআন'
  | 'হাদিস'
  | 'ফিকহ্ ও উসুল'
  | 'বালাগাত ও মানতিক'
  | 'বাংলা'
  | 'ইংরেজি'
  | 'আইসিটি ও সাধারণ জ্ঞান';

export type CadreTier = 
  | 'প্রভাষক (আরবি)'
  | 'সহকারী শিক্ষক (আরবি)'
  | 'সহকারী মৌলভী'
  | 'ইবতেদায়ী প্রধান';

export type Difficulty = 'সহজ' | 'মাঝারি' | 'কঠিন';

export interface Question {
  id: string;
  question_bn: string;
  question_ar?: string;
  options: [string, string, string, string];
  correct_option: number; // 0, 1, 2, 3
  explanation: string;
  subject: Subject;
  topic: string;
  cadre_tier: CadreTier;
  difficulty: Difficulty;
  usage_count?: number;
  created_at: string;
}

export interface ModelTest {
  id: string;
  title: string;
  subtitle: string;
  subject: Subject;
  cadre_tier: CadreTier;
  duration_minutes: number;
  total_marks: number;
  pass_mark: number;
  negative_marking: boolean;
  is_premium: boolean;
  is_published: boolean;
  question_ids: string[];
  created_at: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  video_url?: string;
  pdf_url?: string;
  quiz_id?: string;
  is_free_preview?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  cadre_tier: CadreTier;
  price_monthly: number;
  price_6month: number;
  price_annual: number;
  image_url: string;
  is_published: boolean;
  enrolled_count: number;
  modules: CourseModule[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'student';
  is_vip: boolean;
  cadre_target: CadreTier;
  subscription_expires_at?: string;
  created_at: string;
}

export interface WrittenQuestion {
  id: string;
  title: string;
  subject: Subject;
  marks: number;
  question_bn: string;
  question_ar?: string;
  model_answer_bn: string;
  model_answer_ar?: string;
  rubric: string; // Evaluation rubric criteria for AI auto-grading
  created_at: string;
}

export interface GlossaryTerm {
  id: string;
  term_ar: string;
  root_word: string; // মাদ্দাহ
  meaning_bn: string;
  example_usage: string;
  subject: Subject;
  created_at: string;
}

export interface ResourceFile {
  id: string;
  title: string;
  category: Subject | 'General';
  file_type: 'pdf' | 'doc' | 'sheet';
  url: string;
  size_mb: number;
  is_vip_only: boolean;
  download_count: number;
  created_at: string;
}

export interface SystemStats {
  totalQuestions: number;
  activeModelTests: number;
  totalStudents: number;
  activeVIPSubscriptions: number;
  dailyExamAttempts: number;
}

export interface AIParseResult {
  questions: Array<{
    question_bn: string;
    question_ar?: string;
    options: [string, string, string, string];
    correct_option: number;
    explanation: string;
    topic?: string;
    difficulty?: Difficulty;
  }>;
}

export interface WrittenEvaluationResult {
  score: number;
  maxScore: number;
  feedback_bn: string;
  arabic_corrections?: string;
  strengths: string[];
  improvements: string[];
}
