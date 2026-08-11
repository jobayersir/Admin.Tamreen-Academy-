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

let _supabaseClient: SupabaseClient | null = null;
let _activeUrl = '';
let _activeKey = '';

export function getSupabase(): SupabaseClient | null {
  const metaEnv = (import.meta as any).env || {};
  let url = '';
  let key = '';

  if (typeof window !== 'undefined') {
    url = localStorage.getItem('tamreen_supabase_url') || metaEnv.VITE_SUPABASE_URL || '';
    key = localStorage.getItem('tamreen_supabase_anon_key') || metaEnv.VITE_SUPABASE_ANON_KEY || '';
  } else {
    url = metaEnv.VITE_SUPABASE_URL || '';
    key = metaEnv.VITE_SUPABASE_ANON_KEY || '';
  }

  url = url.trim().replace(/\/+$/, '');
  key = key.trim();

  if (!url || !key || url.includes('your-supabase-project')) {
    _supabaseClient = null;
    return null;
  }

  if (!_supabaseClient || _activeUrl !== url || _activeKey !== key) {
    try {
      _supabaseClient = createClient(url, key);
      _activeUrl = url;
      _activeKey = key;
    } catch {
      _supabaseClient = null;
    }
  }

  return _supabaseClient;
}

export const isSupabaseConfigured = (): boolean => getSupabase() !== null;

// Proxy property for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) return undefined;
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export function saveCustomSupabaseConfig(url: string, key: string) {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = key.trim();
  localStorage.setItem('tamreen_supabase_url', cleanUrl);
  localStorage.setItem('tamreen_supabase_anon_key', cleanKey);
  _supabaseClient = null;
}

export function clearCustomSupabaseConfig() {
  localStorage.removeItem('tamreen_supabase_url');
  localStorage.removeItem('tamreen_supabase_anon_key');
  _supabaseClient = null;
}

export function getCustomSupabaseConfig(): { url: string; key: string; isCustom: boolean } {
  const metaEnv = (import.meta as any).env || {};
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('tamreen_supabase_url') || '' : '';
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('tamreen_supabase_anon_key') || '' : '';
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  if (customUrl && customKey) {
    return { url: customUrl, key: customKey, isCustom: true };
  }
  return { url: envUrl, key: envKey, isCustom: false };
}

export async function testSupabaseConnection(urlInput?: string, keyInput?: string): Promise<{ success: boolean; error?: string }> {
  let clientToTest: SupabaseClient | null = null;
  if (urlInput && keyInput) {
    try {
      clientToTest = createClient(urlInput.trim().replace(/\/+$/, ''), keyInput.trim());
    } catch (e: any) {
      return { success: false, error: 'ভুল URL বা Key ফরম্যাট!' };
    }
  } else {
    clientToTest = getSupabase();
  }

  if (!clientToTest) {
    return { success: false, error: 'Supabase URL এবং Anon Key অনুপস্থিত।' };
  }

  try {
    const res = await withTimeout(clientToTest.from('questions').select('id').limit(1), 4000);
    if (res.error) {
      if (res.error.code === '42P01') {
        return { success: false, error: 'Supabase-এ সংযোগ সফল! কিন্তু `questions` টেবিলটি এখনো তৈরি হয়নি। নিচে থেকে SQL ডেসক্রিপশন স্ক্রিপ্ট রান করুন।' };
      }
      return { success: false, error: `Supabase ত্রুটি: ${res.error.message}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'নেটওয়ার্ক টাইমআউট বা ইন্টারনেটে সংযোগের সমস্যা। URL ও Key আবার চেক করুন।' };
  }
}

export async function checkSupabaseConnection(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const res = await withTimeout(client.from('questions').select('id').limit(1), 2500);
    return !res.error;
  } catch {
    return false;
  }
}

// LocalStorage Persistence Keys
export const STORAGE_KEYS = {
  QUESTIONS: 'tamreen_questions_v1',
  MODEL_TESTS: 'tamreen_model_tests_v1',
  COURSES: 'tamreen_courses_v1',
  USERS: 'tamreen_users_v1',
  WRITTEN: 'tamreen_written_v1',
  GLOSSARY: 'tamreen_glossary_v1',
  RESOURCES: 'tamreen_resources_v1',
};

// Network timeout wrapper for mobile data stability
function withTimeout<T = any>(promiseLike: PromiseLike<T>, ms = 3000): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
  ]);
}

// Helper to initialize LocalStorage if empty & purge legacy default sample items
function initLocalStorage() {
  if (typeof window === 'undefined') return;

  const legacySampleIds = new Set([
    'q-101', 'q-102', 'q-103', 'q-104', 'q-105', 'q-106',
    'mt-201', 'mt-202',
    'c-301', 'c-302',
    'u-401', 'u-402', 'u-403',
    'wq-501',
    'g-601', 'g-602',
    'rf-701', 'rf-702'
  ]);

  const purgeKey = (key: string) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed: any[] = JSON.parse(raw);
        const filtered = parsed.filter(item => !item.id || !legacySampleIds.has(item.id));
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch {
        localStorage.setItem(key, JSON.stringify([]));
      }
    } else {
      localStorage.setItem(key, JSON.stringify([]));
    }
  };

  purgeKey(STORAGE_KEYS.QUESTIONS);
  purgeKey(STORAGE_KEYS.MODEL_TESTS);
  purgeKey(STORAGE_KEYS.COURSES);
  purgeKey(STORAGE_KEYS.USERS);
  purgeKey(STORAGE_KEYS.WRITTEN);
  purgeKey(STORAGE_KEYS.GLOSSARY);
  purgeKey(STORAGE_KEYS.RESOURCES);
}

initLocalStorage();

export function getLocal<T>(key: string, fallback: T[]): T[] {
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

// Helper UUID generator for cross-database type compatibility (UUID & TEXT)
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Helper to execute safe Supabase upsert/save with fallback for legacy IDs and missing columns
async function safeSupabaseSave<T extends { id: string }>(
  tableName: string,
  record: T,
  originalId?: string
): Promise<T> {
  const client = getSupabase();
  const validId = isValidUuid(record.id) ? record.id : generateUuid();
  const fullRecord = { ...record, id: validId };

  if (!client) return fullRecord;

  let activePayload: any = { ...fullRecord };
  const isEdit = Boolean(originalId && isValidUuid(originalId));
  let maxRetries = 6;

  while (maxRetries > 0) {
    try {
      let res: { data: any[] | null; error: any };

      if (isEdit) {
        res = await client.from(tableName).update(activePayload).eq('id', validId).select();
        // If row did not exist in DB yet during edit, try inserting
        if (!res.error && (!res.data || res.data.length === 0)) {
          res = await client.from(tableName).insert([activePayload]).select();
        }
      } else {
        res = await client.from(tableName).insert([activePayload]).select();
      }

      if (!res.error) {
        const savedFromDb = (res.data && res.data[0]) ? res.data[0] : {};
        return { ...fullRecord, ...savedFromDb, id: validId };
      }

      const errMsg = res.error.message || '';
      console.warn(`[Supabase Save Warn] Error saving to '${tableName}':`, errMsg);

      // Check if DB table is missing a column (e.g. show_as_upcoming, scheduled_at, etc.)
      const missingColMatch =
        errMsg.match(/Could not find the '([^']+)' column/i) ||
        errMsg.match(/column ["']([^"']+)["'] of relation/i) ||
        errMsg.match(/column ["']([^"']+)["'] does not exist/i) ||
        errMsg.match(/has no column named ["']([^"']+)["']/i);

      if (missingColMatch && missingColMatch[1]) {
        const missingCol = missingColMatch[1];
        if (missingCol in activePayload) {
          console.warn(`[Supabase Auto-Fix] Table '${tableName}' lacks column '${missingCol}'. Stripping column and retrying DB save...`);
          delete activePayload[missingCol];
          maxRetries--;
          continue;
        }
      }

      // If invalid UUID error, regenerate fresh UUID and retry insert
      if (res.error.code === '22P02' || errMsg.includes('uuid')) {
        const freshId = generateUuid();
        activePayload.id = freshId;
        const ins = await client.from(tableName).insert([activePayload]).select();
        if (!ins.error) {
          const savedFromDb = (ins.data && ins.data[0]) ? ins.data[0] : {};
          return { ...fullRecord, ...savedFromDb, id: freshId };
        }
      }

      // Unresolvable error: break loop and fallback to local cache
      break;
    } catch (err: any) {
      console.warn(`[Supabase Exception] Error saving to '${tableName}':`, err);
      break;
    }
  }

  // Fallback: Return fullRecord so local storage & state update completes cleanly
  return fullRecord;
}

// ==================== QUESTIONS API ====================
export async function getQuestions(): Promise<Question[]> {
  const localList = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('questions').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getQuestions error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, Question>();
        localList.forEach(item => map.set(item.id, item));
        (res.data as Question[]).forEach(item => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase fetch questions failed, falling back to local cache:', err);
    }
  }
  return localList;
}

export async function saveQuestion(q: Omit<Question, 'id' | 'created_at'> & { id?: string }): Promise<Question> {
  const originalId = q.id;
  const qId = (originalId && isValidUuid(originalId)) ? originalId : generateUuid();

  const newQuestion: Question = {
    ...q,
    id: qId,
    question_bn: q.question_bn || '',
    question_ar: q.question_ar || '',
    options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
    correct_option: Number(q.correct_option) || 0,
    explanation: q.explanation || '',
    subject: q.subject || '',
    topic: q.topic || '',
    cadre_tier: q.cadre_tier || '',
    difficulty: q.difficulty || 'মাঝারি',
    usage_count: Number(q.usage_count) || 0,
    created_at: new Date().toISOString()
  } as Question;

  const savedRecord = await safeSupabaseSave<Question>('questions', newQuestion, originalId);

  const list = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  let updatedList = list;
  if (originalId && originalId !== savedRecord.id) {
    updatedList = updatedList.filter(item => item.id !== originalId);
  }
  const idx = updatedList.findIndex(item => item.id === savedRecord.id);
  if (idx !== -1) updatedList[idx] = savedRecord;
  else updatedList.unshift(savedRecord);

  setLocal(STORAGE_KEYS.QUESTIONS, updatedList);
  return savedRecord;
}

export async function bulkSaveQuestions(qs: Omit<Question, 'id' | 'created_at'>[]): Promise<Question[]> {
  const newQuestions: Question[] = qs.map((q) => ({
    ...q,
    id: generateUuid(),
    created_at: new Date().toISOString()
  }));

  const client = getSupabase();
  let savedList = newQuestions;

  if (client) {
    console.log('[Supabase API] Bulk saving questions:', newQuestions.length);
    const { data, error } = await client.from('questions').insert(newQuestions).select();
    if (error) {
      console.error('[Supabase Error] Bulk insert questions error:', error);
      throw new Error(`Supabase-এ বাল্ক প্রশ্ন সেভ ব্যর্থ: ${error.message}`);
    }
    if (data && data.length > 0) savedList = data as Question[];
  }

  const list = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  const updated = [...savedList, ...list];
  setLocal(STORAGE_KEYS.QUESTIONS, updated);

  return savedList;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isValidUuid(id)) {
    const { error } = await client.from('questions').delete().eq('id', id);
    if (error && error.code !== '22P02') {
      console.error('[Supabase Error] Delete question error:', error);
      throw new Error(`Supabase-এ প্রশ্ন ডিলিট ব্যর্থ: ${error.message}`);
    }
  }

  const list = getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  setLocal(STORAGE_KEYS.QUESTIONS, list.filter(q => q.id !== id));
  return true;
}

// Helper to parse and normalize question_ids from JSON strings, arrays, or comma-delimited strings
export function parseQuestionIds(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'object' && item !== null ? String(item.id || item) : String(item)))
      .filter((s) => s.trim().length > 0);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === 'object' && item !== null ? String(item.id || item) : String(item)))
            .filter((s) => s.trim().length > 0);
        }
      } catch {
        // fallback
      }
    }
    return trimmed.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  }
  return [];
}

export function normalizeModelTest(test: any): ModelTest {
  return {
    ...test,
    id: String(test.id),
    title: test.title || '',
    subtitle: test.subtitle || '',
    subject: test.subject || '',
    cadre_tier: test.cadre_tier || '',
    duration_minutes: Number(test.duration_minutes) || 60,
    total_marks: Number(test.total_marks) || 100,
    pass_mark: Number(test.pass_mark) || 50,
    negative_marking: test.negative_marking !== undefined ? Boolean(test.negative_marking) : true,
    is_premium: Boolean(test.is_premium),
    is_published: test.is_published !== undefined ? Boolean(test.is_published) : true,
    scheduled_at: test.scheduled_at || undefined,
    show_as_upcoming: test.show_as_upcoming !== undefined ? Boolean(test.show_as_upcoming) : true,
    question_ids: parseQuestionIds(test.question_ids),
    created_at: test.created_at || new Date().toISOString()
  };
}

// ==================== MODEL TESTS API ====================
export async function getModelTests(): Promise<ModelTest[]> {
  const localList = getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS).map(normalizeModelTest);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('model_tests').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getModelTests query error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, ModelTest>();
        // Set local cached items first
        localList.forEach(item => map.set(item.id, item));
        // Overwrite with live Supabase database records
        (res.data as any[]).forEach(item => {
          const normalized = normalizeModelTest(item);
          map.set(normalized.id, normalized);
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase model tests fetch failed, using local cache:', err);
    }
  }
  return localList;
}

export async function saveModelTest(test: Omit<ModelTest, 'id' | 'created_at'> & { id?: string }): Promise<ModelTest> {
  const originalId = test.id;
  const testId = (originalId && isValidUuid(originalId)) ? originalId : generateUuid();

  const modelTest: ModelTest = normalizeModelTest({
    ...test,
    id: testId
  });

  const savedRecord = await safeSupabaseSave<ModelTest>('model_tests', modelTest, originalId);
  const finalRecord = normalizeModelTest(savedRecord);

  // Update local storage cache
  const list = getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS).map(normalizeModelTest);
  let updatedList = list;
  if (originalId && originalId !== finalRecord.id) {
    updatedList = updatedList.filter(m => m.id !== originalId);
  }
  const idx = updatedList.findIndex(m => m.id === finalRecord.id);
  if (idx !== -1) updatedList[idx] = finalRecord;
  else updatedList.unshift(finalRecord);

  setLocal(STORAGE_KEYS.MODEL_TESTS, updatedList);
  return finalRecord;
}

export async function deleteModelTest(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isValidUuid(id)) {
    console.log('[Supabase API] Deleting model_test:', id);
    const { error } = await client.from('model_tests').delete().eq('id', id);
    if (error && error.code !== '22P02') {
      console.error('[Supabase Error] Delete model_test error:', error);
      throw new Error(`Supabase-এ মডেল টেস্ট মুছতে ব্যর্থ: ${error.message}`);
    }
  }

  const list = getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS);
  setLocal(STORAGE_KEYS.MODEL_TESTS, list.filter(m => m.id !== id));
  return true;
}

// ==================== COURSES API ====================
export async function getCourses(): Promise<Course[]> {
  const localList = getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('courses').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getCourses query error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, Course>();
        localList.forEach(item => map.set(item.id, item));
        (res.data as Course[]).forEach(item => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase courses fetch failed:', err);
    }
  }
  return localList;
}

export async function saveCourse(course: Omit<Course, 'id' | 'created_at'> & { id?: string }): Promise<Course> {
  const originalId = course.id;
  const courseId = (originalId && isValidUuid(originalId)) ? originalId : generateUuid();

  const fullCourse: Course = {
    ...course,
    id: courseId,
    title: course.title || '',
    description: course.description || '',
    subject: course.subject || '',
    cadre_tier: course.cadre_tier || '',
    price_monthly: Number(course.price_monthly) || 299,
    price_6month: Number(course.price_6month) || 999,
    price_annual: Number(course.price_annual) || 1499,
    image_url: course.image_url || '',
    is_published: Boolean(course.is_published),
    enrolled_count: Number(course.enrolled_count) || 0,
    modules: Array.isArray(course.modules) ? course.modules : [],
    created_at: new Date().toISOString()
  } as Course;

  const savedRecord = await safeSupabaseSave<Course>('courses', fullCourse, originalId);

  const list = getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  let updatedList = list;
  if (originalId && originalId !== savedRecord.id) {
    updatedList = updatedList.filter(c => c.id !== originalId);
  }
  const idx = updatedList.findIndex(c => c.id === savedRecord.id);
  if (idx !== -1) updatedList[idx] = savedRecord;
  else updatedList.unshift(savedRecord);

  setLocal(STORAGE_KEYS.COURSES, updatedList);
  return savedRecord;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isValidUuid(id)) {
    const { error } = await client.from('courses').delete().eq('id', id);
    if (error && error.code !== '22P02') {
      console.error('[Supabase Error] Delete course error:', error);
      throw new Error(`Supabase-এ কোর্স ডিলিট ব্যর্থ: ${error.message}`);
    }
  }

  const list = getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  setLocal(STORAGE_KEYS.COURSES, list.filter(c => c.id !== id));
  return true;
}

// ==================== USERS & SUBSCRIPTIONS API ====================
export async function getUsers(): Promise<UserProfile[]> {
  const localList = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('users_profile').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getUsers query error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, UserProfile>();
        localList.forEach(item => map.set(item.id, item));
        (res.data as UserProfile[]).forEach(item => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase users fetch failed:', err);
    }
  }
  return localList;
}

export async function toggleUserVip(userId: string, currentVip: boolean): Promise<UserProfile> {
  const isVip = !currentVip;
  const expiresAt = isVip ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined;

  const client = getSupabase();
  if (client) {
    const { error } = await client.from('users_profile').update({ is_vip: isVip, subscription_expires_at: expiresAt }).eq('id', userId);
    if (error) {
      console.error('[Supabase Error] Toggle VIP error:', error);
      throw new Error(`Supabase-এ ভিআইপি আপডেট ব্যর্থ: ${error.message}`);
    }
  }

  const list = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = list.findIndex(u => u.id === userId);
  let updatedUser: UserProfile | null = null;
  if (idx !== -1) {
    list[idx].is_vip = isVip;
    list[idx].subscription_expires_at = expiresAt;
    setLocal(STORAGE_KEYS.USERS, list);
    updatedUser = list[idx];
  }

  if (updatedUser) return updatedUser;
  throw new Error('User not found');
}

// ==================== WRITTEN QUESTIONS API ====================
export async function getWrittenQuestions(): Promise<WrittenQuestion[]> {
  const localList = getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('written_questions').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getWrittenQuestions error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, WrittenQuestion>();
        localList.forEach(item => map.set(item.id, item));
        (res.data as WrittenQuestion[]).forEach(item => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase written fetch failed:', err);
    }
  }
  return localList;
}

export async function saveWrittenQuestion(wq: Omit<WrittenQuestion, 'id' | 'created_at'> & { id?: string }): Promise<WrittenQuestion> {
  const originalId = wq.id;
  const item: WrittenQuestion = {
    ...wq,
    id: (originalId && isValidUuid(originalId)) ? originalId : generateUuid(),
    created_at: new Date().toISOString()
  };

  const savedRecord = await safeSupabaseSave<WrittenQuestion>('written_questions', item, originalId);

  const list = getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS);
  let updatedList = list;
  if (originalId && originalId !== savedRecord.id) {
    updatedList = updatedList.filter(w => w.id !== originalId);
  }
  const idx = updatedList.findIndex(w => w.id === savedRecord.id);
  if (idx !== -1) updatedList[idx] = savedRecord;
  else updatedList.unshift(savedRecord);

  setLocal(STORAGE_KEYS.WRITTEN, updatedList);
  return savedRecord;
}

export async function deleteWrittenQuestion(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isValidUuid(id)) {
    const { error } = await client.from('written_questions').delete().eq('id', id);
    if (error && error.code !== '22P02') {
      console.error('[Supabase Error] Delete written question error:', error);
      throw new Error(`Supabase-এ সেভড প্রশ্ন ডিলিট ব্যর্থ: ${error.message}`);
    }
  }

  const list = getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS);
  setLocal(STORAGE_KEYS.WRITTEN, list.filter(w => w.id !== id));
  return true;
}

// ==================== GLOSSARY & RESOURCES API ====================
export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  const localList = getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('glossary').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getGlossaryTerms error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, GlossaryTerm>();
        localList.forEach(item => map.set(item.id, item));
        (res.data as GlossaryTerm[]).forEach(item => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase glossary fetch failed:', err);
    }
  }
  return localList;
}

export async function saveGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'created_at'> & { id?: string }): Promise<GlossaryTerm> {
  const originalId = term.id;
  const item: GlossaryTerm = {
    ...term,
    id: (originalId && isValidUuid(originalId)) ? originalId : generateUuid(),
    created_at: new Date().toISOString()
  };

  const savedRecord = await safeSupabaseSave<GlossaryTerm>('glossary', item, originalId);

  const list = getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
  let updatedList = list;
  if (originalId && originalId !== savedRecord.id) {
    updatedList = updatedList.filter(g => g.id !== originalId);
  }
  const idx = updatedList.findIndex(g => g.id === savedRecord.id);
  if (idx !== -1) updatedList[idx] = savedRecord;
  else updatedList.unshift(savedRecord);

  setLocal(STORAGE_KEYS.GLOSSARY, updatedList);
  return savedRecord;
}

export async function deleteGlossaryTerm(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isValidUuid(id)) {
    const { error } = await client.from('glossary').delete().eq('id', id);
    if (error && error.code !== '22P02') {
      console.error('[Supabase Error] Delete glossary error:', error);
      throw new Error(`Supabase-এ গ্লোসারি ডিলিট ব্যর্থ: ${error.message}`);
    }
  }
  const list = getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
  setLocal(STORAGE_KEYS.GLOSSARY, list.filter(g => g.id !== id));
  return true;
}

export async function getLectureSheets(): Promise<LectureSheet[]> {
  const localList = getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  const client = getSupabase();
  if (client) {
    try {
      const res = await withTimeout(client.from('resources').select('*').order('created_at', { ascending: false }), 4000);
      if (res.error) {
        console.warn('[Supabase Warn] getLectureSheets error:', res.error.message);
      } else if (res.data) {
        const map = new Map<string, LectureSheet>();
        localList.forEach(item => map.set(item.id, item));
        (res.data as LectureSheet[]).forEach(item => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }
    } catch (err) {
      console.warn('Supabase resources fetch failed:', err);
    }
  }
  return localList;
}

export async function saveLectureSheet(res: Omit<LectureSheet, 'id' | 'created_at'> & { id?: string }): Promise<LectureSheet> {
  const originalId = res.id;
  const item: LectureSheet = {
    ...res,
    id: (originalId && isValidUuid(originalId)) ? originalId : generateUuid(),
    download_count: res.download_count || 0,
    created_at: new Date().toISOString()
  };

  const savedRecord = await safeSupabaseSave<LectureSheet>('resources', item, originalId);

  const list = getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  let updatedList = list;
  if (originalId && originalId !== savedRecord.id) {
    updatedList = updatedList.filter(r => r.id !== originalId);
  }
  const idx = updatedList.findIndex(r => r.id === savedRecord.id);
  if (idx !== -1) updatedList[idx] = savedRecord;
  else updatedList.unshift(savedRecord);

  setLocal(STORAGE_KEYS.RESOURCES, updatedList);
  return savedRecord;
}

export async function deleteLectureSheet(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isValidUuid(id)) {
    const { error } = await client.from('resources').delete().eq('id', id);
    if (error && error.code !== '22P02') {
      console.error('[Supabase Error] Delete resource error:', error);
      throw new Error(`Supabase-এ রিসোর্স ডিলিট ব্যর্থ: ${error.message}`);
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
  id TEXT PRIMARY KEY,
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
  time_limit_seconds INT,
  marks INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MODEL TESTS TABLE
CREATE TABLE IF NOT EXISTS public.model_tests (
  id TEXT PRIMARY KEY,
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
  scheduled_at TIMESTAMPTZ,
  show_as_upcoming BOOLEAN DEFAULT FALSE,
  question_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRATION COMMANDS FOR EXISTING TABLES
ALTER TABLE public.model_tests ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.model_tests ADD COLUMN IF NOT EXISTS show_as_upcoming BOOLEAN DEFAULT FALSE;

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT DEFAULT '2.5 MB',
  is_vip_only BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE ROW LEVEL SECURITY (RLS) TO PERMIT DIRECT INSERTS/SELECTS
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.written_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;

-- INDEXES FOR FAST FILTERING
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_cadre ON public.questions(cadre_tier);
CREATE INDEX IF NOT EXISTS idx_model_tests_published ON public.model_tests(is_published);
`;
