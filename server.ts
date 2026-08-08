import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

function getAI(): GoogleGenAI {
  if (!aiClient) {
    if (process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      return aiClient;
    }
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return aiClient;
}

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL),
    timestamp: new Date().toISOString()
  });
});

// Mode 2: Copy-Paste AI Text Parser
app.post('/api/ai/parse-text', async (req, res) => {
  try {
    const { rawText, defaultSubject, defaultCadreTier } = req.body;
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const ai = getAI();
    const prompt = `
You are an expert AI exam content extractor for Tamreen Academy (তামরীন একাডেমি - NTRCA Arabic Cadre Prep).
Analyze the following raw, unformatted text containing exam questions and extract every single MCQ into structured JSON.
Ensure Arabic text is preserved accurately with proper diacritics/tashkeel if available.
Map options to exactly 4 distinct choices. Identify the correct answer (0 for A, 1 for B, 2 for C, 3 for D).
Provide a clear, educational explanation in Bengali (with Arabic references if needed).

Default Subject: ${defaultSubject || 'বালাগাত ও মানতিক'}
Default Cadre Tier: ${defaultCadreTier || 'প্রভাষক (আরবি)'}

Raw Input Text:
"""
${rawText}
"""
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_bn: { type: Type.STRING, description: 'Bengali question text' },
                  question_ar: { type: Type.STRING, description: 'Arabic question text if available' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 option strings'
                  },
                  correct_option: { type: Type.INTEGER, description: '0 for A, 1 for B, 2 for C, 3 for D' },
                  explanation: { type: Type.STRING, description: 'Detailed explanation in Bengali' },
                  topic: { type: Type.STRING, description: 'Topic or chapter name' },
                  difficulty: { type: Type.STRING, description: 'সহজ or মাঝারি or কঠিন' }
                },
                required: ['question_bn', 'options', 'correct_option', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsed);
  } catch (err: any) {
    console.error('API /api/ai/parse-text error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse raw text with AI.' });
  }
});

// Mode 3: Fully Automated AI Question Generator
app.post('/api/ai/generate-questions', async (req, res) => {
  try {
    const { subject, topic, cadreTier, count, difficulty } = req.body;
    const reqCount = Math.min(Math.max(Number(count) || 5, 1), 20);

    const ai = getAI();
    const prompt = `
Create ${reqCount} authentic, high-quality, non-repetitive multiple-choice questions (MCQs) for Tamreen Academy (তামরীন একাডেমি).
Target Exam Tier: ${cadreTier || 'প্রভাষক (আরবি)'}
Subject: ${subject || 'বালাগাত ও মানতিক'}
Topic: ${topic || 'সাধারণ প্রস্তুতি'}
Difficulty Level: ${difficulty || 'মাঝারি'}

Requirements:
- Each question must follow NTRCA / BCS / Madrasah Lecturer Board standards.
- Include proper Arabic text (question_ar) and clear Bengali translation (question_bn).
- Exactly 4 options (Option 0, 1, 2, 3).
- Accurately mark the correct option index (0, 1, 2, or 3).
- Write an extensive, authoritative explanation (explanation) in Bengali citing classical Arabic grammar, Balaghat (علم المعاني والبيان), Fiqh, Hadith rules, or Literature references.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite NTRCA Arabic Cadre Exam Question Setter with deep knowledge of Classical Arabic Literature, Quranic Tajweed, Hadith terminology, Fiqh, Balaghat, Mantiq, and General Knowledge.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_bn: { type: Type.STRING },
                  question_ar: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correct_option: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                },
                required: ['question_bn', 'options', 'correct_option', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsed);
  } catch (err: any) {
    console.error('API /api/ai/generate-questions error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate questions with AI.' });
  }
});

// CQ & Written Exam Auto-Grading Sandbox
app.post('/api/ai/evaluate-written', async (req, res) => {
  try {
    const { questionText, modelAnswer, userSubmission, systemPrompt, maxMarks } = req.body;

    const ai = getAI();
    const prompt = `
You are the Tamreen AI Written Exam Auto-Grader for NTRCA Lecturer & Assistant Teacher candidates.
Question: ${questionText}
Model Answer: ${modelAnswer}
User Submission: ${userSubmission}
Max Marks: ${maxMarks || 10}

Evaluation Rubric Guidelines:
${systemPrompt || 'Evaluate based on accuracy of Arabic citations, clarity of explanation, grammar, and completeness.'}

Provide evaluation results in structured JSON:
- score (numeric integer out of ${maxMarks || 10})
- feedback_bn (detailed evaluation breakdown in Bengali)
- arabic_corrections (specific Arabic grammatical or spelling fixes if relevant)
- strengths (array of strings)
- improvements (array of strings)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            maxScore: { type: Type.INTEGER },
            feedback_bn: { type: Type.STRING },
            arabic_corrections: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['score', 'feedback_bn', 'strengths', 'improvements']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('API /api/ai/evaluate-written error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate written answer.' });
  }
});

// ==================== VITE & STATIC SERVER ====================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tamreen Academy Admin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
