import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Question, ModelTest, Course, UserProfile, WrittenQuestion, GlossaryTerm, LectureSheet } from '../types';
import { 
  INITIAL_QUESTIONS, 
  INITIAL_MODEL_TESTS, 
  INITIAL_COURSES, 
  INITIAL_USERS, 
  INITIAL_WRITTEN_QUESTIONS, 
  INITIAL_GLOSSARY, 
  INITIAL_RESOURCES 
} from './initialData';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('questions').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// LocalStorage Persistence Keys
const STORAGE_KEYS = {
  QUESTIONS: 'tamreen_questions_v1',
  MODEL_TESTS: 'tamreen_model_tests_v1',
  COURSES: 'tamreen_courses_v1',
  USERS: 'tamreen_users_v1',
  WRITTEN: 'tamreen_written_v1',
  GLOSSARY: 'tamreen_glossary_v1',
  RESOURCES: 'tamreen_resources_v1',
};

// Helper to initialize LocalStorage if empty
function initLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MODEL_TESTS)) {
    localStorage.setItem(STORAGE_KEYS.MODEL_TESTS, JSON.stringify(INITIAL_MODEL_TESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WRITTEN)) {
    localStorage.setItem(STORAGE_KEYS.WRITTEN, JSON.stringify(INITIAL_WRITTEN_QUESTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GLOSSARY)) {
    localStorage.setItem(STORAGE_KEYS.GLOSSARY, JSON.stringify(INITIAL_GLOSSARY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
  }
}

initLocalStorage();

function getLocal<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Error reading local storage:', e);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to local storage:', e);
  }
}

// ==================== QUESTIONS API ====================
export async function getQuestions(): Promise<Question[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Question[];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local persistence:', err);
    }
  }
  return getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
}

export async function saveQuestion(q: Omit<Question, 'id' | 'created_at'> & { id?: string }): Promise<Question> {
  const isEdit = Boolean(q.id);
  const newQuestion: Question = {
    ...q,
    id: q.id || 'q-' + Date.now(),
    created_at: new Date().toISOString()
  } as Question;

  if (supabase) {
    try {
      if (isEdit) {
        await supabase.from('questions').update(newQuestion).eq('id', newQuestion.id);
      } else {
        await supabase.from('questions').insert([newQuestion]);
      }
    } catch (err) {
      console.warn('Supabase insert failed, using local storage:', err);
    }
  }

  const list = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  if (isEdit) {
    const idx = list.findIndex(item => item.id === newQuestion.id);
    if (idx !== -1) list[idx] = newQuestion;
    else list.unshift(newQuestion);
  } else {
    list.unshift(newQuestion);
  }
  setLocal(STORAGE_KEYS.QUESTIONS, list);
  return newQuestion;
}

export async function bulkSaveQuestions(qs: Omit<Question, 'id' | 'created_at'>[]): Promise<Question[]> {
  const newQuestions: Question[] = qs.map((q, idx) => ({
    ...q,
    id: `q-${Date.now()}-${idx}`,
    created_at: new Date().toISOString()
  }));

  if (supabase) {
    try {
      const { data, error } = await supabase.from('questions').insert(newQuestions).select();
      if (!error && data && data.length > 0) return data as Question[];
    } catch (err) {
      console.warn('Supabase bulk insert failed, using local storage:', err);
    }
  }

  const list = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  const updated = [...newQuestions, ...list];
  setLocal(STORAGE_KEYS.QUESTIONS, updated);
  return newQuestions;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('questions').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  const list = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  const filtered = list.filter(q => q.id !== id);
  setLocal(STORAGE_KEYS.QUESTIONS, filtered);
  return true;
}

// ==================== MODEL TESTS API ====================
export async function getModelTests(): Promise<ModelTest[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('model_tests').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as ModelTest[];
    } catch (err) {
      console.warn('Supabase model tests fetch failed:', err);
    }
  }
  return getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS);
}

export async function saveModelTest(test: Omit<ModelTest, 'id' | 'created_at'> & { id?: string }): Promise<ModelTest> {
  const isEdit = Boolean(test.id);
  const modelTest: ModelTest = {
    ...test,
    id: test.id || 'mt-' + Date.now(),
    created_at: new Date().toISOString()
  } as ModelTest;

  if (supabase) {
    try {
      if (isEdit) {
        await supabase.from('model_tests').update(modelTest).eq('id', modelTest.id);
      } else {
        await supabase.from('model_tests').insert([modelTest]);
      }
    } catch (err) {
      console.warn('Supabase model test save failed:', err);
    }
  }

  const list = getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS);
  if (isEdit) {
    const idx = list.findIndex(m => m.id === modelTest.id);
    if (idx !== -1) list[idx] = modelTest;
    else list.unshift(modelTest);
  } else {
    list.unshift(modelTest);
  }
  setLocal(STORAGE_KEYS.MODEL_TESTS, list);
  return modelTest;
}

export async function deleteModelTest(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('model_tests').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete model test failed:', err);
    }
  }
  const list = getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS);
  setLocal(STORAGE_KEYS.MODEL_TESTS, list.filter(m => m.id !== id));
  return true;
}

// ==================== COURSES API ====================
export async function getCourses(): Promise<Course[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Course[];
    } catch (err) {
      console.warn('Supabase courses fetch failed:', err);
    }
  }
  return getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
}

export async function saveCourse(course: Omit<Course, 'id' | 'created_at'> & { id?: string }): Promise<Course> {
  const isEdit = Boolean(course.id);
  const fullCourse: Course = {
    ...course,
    id: course.id || 'c-' + Date.now(),
    created_at: new Date().toISOString()
  } as Course;

  if (supabase) {
    try {
      if (isEdit) {
        await supabase.from('courses').update(fullCourse).eq('id', fullCourse.id);
      } else {
        await supabase.from('courses').insert([fullCourse]);
      }
    } catch (err) {
      console.warn('Supabase save course failed:', err);
    }
  }

  const list = getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  if (isEdit) {
    const idx = list.findIndex(c => c.id === fullCourse.id);
    if (idx !== -1) list[idx] = fullCourse;
    else list.unshift(fullCourse);
  } else {
    list.unshift(fullCourse);
  }
  setLocal(STORAGE_KEYS.COURSES, list);
  return fullCourse;
}

// ==================== USERS & SUBSCRIPTIONS API ====================
export async function getUsers(): Promise<UserProfile[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users_profile').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as UserProfile[];
    } catch (err) {
      console.warn('Supabase users fetch failed:', err);
    }
  }
  return getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export async function toggleUserVip(userId: string, currentVip: boolean): Promise<UserProfile> {
  const isVip = !currentVip;
  const expiresAt = isVip ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined;

  if (supabase) {
    try {
      await supabase.from('users_profile').update({ is_vip: isVip, subscription_expires_at: expiresAt }).eq('id', userId);
    } catch (err) {
      console.warn('Supabase toggle VIP failed:', err);
    }
  }

  const list = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = list.findIndex(u => u.id === userId);
  if (idx !== -1) {
    list[idx].is_vip = isVip;
    list[idx].subscription_expires_at = expiresAt;
    setLocal(STORAGE_KEYS.USERS, list);
    return list[idx];
  }
  throw new Error('User not found');
}

// ==================== WRITTEN QUESTIONS API ====================
export async function getWrittenQuestions(): Promise<WrittenQuestion[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('written_questions').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as WrittenQuestion[];
    } catch (err) {
      console.warn('Supabase written fetch failed:', err);
    }
  }
  return getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS);
}

export async function saveWrittenQuestion(wq: Omit<WrittenQuestion, 'id' | 'created_at'> & { id?: string }): Promise<WrittenQuestion> {
  const isEdit = Boolean(wq.id);
  const item: WrittenQuestion = {
    ...wq,
    id: wq.id || 'wq-' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      if (isEdit) await supabase.from('written_questions').update(item).eq('id', item.id);
      else await supabase.from('written_questions').insert([item]);
    } catch (err) {
      console.warn('Supabase save written failed:', err);
    }
  }

  const list = getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS);
  if (isEdit) {
    const idx = list.findIndex(w => w.id === item.id);
    if (idx !== -1) list[idx] = item;
    else list.unshift(item);
  } else {
    list.unshift(item);
  }
  setLocal(STORAGE_KEYS.WRITTEN, list);
  return item;
}

// ==================== GLOSSARY & RESOURCES API ====================
export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('glossary').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as GlossaryTerm[];
    } catch (err) {
      console.warn('Supabase glossary fetch failed:', err);
    }
  }
  return getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
}

export async function saveGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'created_at'> & { id?: string }): Promise<GlossaryTerm> {
  const isEdit = Boolean(term.id);
  const item: GlossaryTerm = {
    ...term,
    id: term.id || 'g-' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      if (isEdit) await supabase.from('glossary').update(item).eq('id', item.id);
      else await supabase.from('glossary').insert([item]);
    } catch (err) {
      console.warn('Supabase glossary save failed:', err);
    }
  }

  const list = getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
  if (isEdit) {
    const idx = list.findIndex(g => g.id === item.id);
    if (idx !== -1) list[idx] = item;
    else list.unshift(item);
  } else {
    list.unshift(item);
  }
  setLocal(STORAGE_KEYS.GLOSSARY, list);
  return item;
}

export async function deleteGlossaryTerm(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('glossary').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete glossary failed:', err);
    }
  }
  const list = getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
  setLocal(STORAGE_KEYS.GLOSSARY, list.filter(g => g.id !== id));
  return true;
}

export async function getLectureSheets(): Promise<LectureSheet[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as LectureSheet[];
    } catch (err) {
      console.warn('Supabase resources fetch failed:', err);
    }
  }
  return getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
}

export async function saveLectureSheet(res: Omit<LectureSheet, 'id' | 'created_at'> & { id?: string }): Promise<LectureSheet> {
  const isEdit = Boolean(res.id);
  const item: LectureSheet = {
    ...res,
    id: res.id || 'rf-' + Date.now(),
    download_count: res.download_count || 0,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      if (isEdit) await supabase.from('resources').update(item).eq('id', item.id);
      else await supabase.from('resources').insert([item]);
    } catch (err) {
      console.warn('Supabase resource save failed:', err);
    }
  }

  const list = getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  if (isEdit) {
    const idx = list.findIndex(r => r.id === item.id);
    if (idx !== -1) list[idx] = item;
    else list.unshift(item);
  } else {
    list.unshift(item);
  }
  setLocal(STORAGE_KEYS.RESOURCES, list);
  return item;
}

export async function deleteLectureSheet(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('resources').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete resource failed:', err);
    }
  }
  const list = getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  setLocal(STORAGE_KEYS.RESOURCES, list.filter(r => r.id !== id));
  return true;
}

// SQL DDL Schema string for Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- TAMREEN ACADEMY (তামরীন একাডেমি) SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor to provision all tables & indexes.

-- 1. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_bn TEXT NOT NULL,
  question_ar TEXT,
  options JSONB NOT NULL,
  correct_option INT NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  explanation TEXT,
  subject TEXT NOT NULL,
  topic TEXT,
  cadre_tier TEXT NOT NULL,
  difficulty TEXT DEFAULT 'মাঝারি',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MODEL TESTS TABLE
CREATE TABLE IF NOT EXISTS public.model_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  subject TEXT NOT NULL,
  cadre_tier TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  total_marks INT NOT NULL DEFAULT 100,
  pass_mark INT DEFAULT 50,
  negative_marking BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  question_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  cadre_tier TEXT NOT NULL,
  price_monthly NUMERIC DEFAULT 299,
  price_6month NUMERIC DEFAULT 999,
  price_annual NUMERIC DEFAULT 1499,
  image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  enrolled_count INT DEFAULT 0,
  modules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  is_vip BOOLEAN DEFAULT FALSE,
  cadre_target TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WRITTEN QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.written_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks INT DEFAULT 10,
  question_bn TEXT NOT NULL,
  question_ar TEXT,
  model_answer_bn TEXT,
  model_answer_ar TEXT,
  rubric TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GLOSSARY TABLE
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_ar TEXT NOT NULL,
  root_word TEXT,
  definition_bn TEXT NOT NULL,
  example_ar TEXT,
  example_bn TEXT,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT DEFAULT '2.5 MB',
  is_vip_only BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST FILTERING
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_cadre ON public.questions(cadre_tier);
CREATE INDEX IF NOT EXISTS idx_model_tests_published ON public.model_tests(is_published);
`;
