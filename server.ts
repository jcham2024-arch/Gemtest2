import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI client with standard User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    engine: 'Lean Java Agentic Core (LJAC) Platform Server',
    targetJdk: 'Java 21 LTS (java.base)',
  });
});

// Search-Grounded Architectural Research via gemini-3.8-flash
app.post('/api/research', async (req, res) => {
  try {
    const { query, topic } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
      return;
    }

    const systemPrompt = `You are a Principal Java 21 Architect specializing in the Lean Java Agentic Core (LJAC).
Target platform: Java 21 LTS strictly limited to the java.base module (Zero external runtime dependencies).
Key constraints:
- No Jackson, Gson, Spring, Apache Commons, or OkHttp.
- Polyglot: Java 21 POJOs/Records orchestration core + TypeScript (Deno/Bun/ts-node) primary guest runner + Python 3 secondary.
- Deterministic memory scrubbing using char[] buffers for credentials.
- OS-level subprocess isolation via ProcessBuilder and recursive ProcessHandle.descendants() tree termination.
- Zero-dependency JSON AST & recursive-descent parser.
- Sliding-window ContextCompactor preserving System prompts.
- Virtual threads (Thread.ofVirtual()) for asynchronous stream drainage.

Provide a rigorous, technically accurate architectural answer with exact JDK 21 APIs, security considerations, and practical code design patterns.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\nUser Question regarding [${topic || 'LJAC Architecture'}]:\n${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || 'No response generated.';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Array<{ title: string; uri: string }> = [];

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }

    res.json({
      answer: text,
      sources,
      searchQueries: groundingMetadata?.webSearchQueries || [],
      model: 'gemini-3.8-flash',
      grounded: sources.length > 0,
    });
  } catch (error: any) {
    console.error('Error during search-grounded research:', error);
    res.status(500).json({
      error: error?.message || 'Failed to complete architectural research query',
    });
  }
});

// High-Thinking Deep Architectural Analysis via gemini-4-argon
app.post('/api/deep-think', async (req, res) => {
  try {
    const { query, topic, codeContext } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
      return;
    }

    const systemPrompt = `You are an elite Systems Software Architect performing formal architectural evaluation of the Lean Java Agentic Core (LJAC).
Evaluate with mathematical and security rigor under Java 21 java.base constraints (Zero external dependencies).
Analyze edge cases: process deadlocks in OS pipes, memory heap extraction vectors, race conditions in CancellationToken, SSE stream framing, and context window compaction algorithms.
Follow atomic POJO rules (< 120 LOC) and standardized high-density Javadoc tags (@summary, @threadsafe, @security, @contract).`;

    const fullPrompt = `${systemPrompt}\n\nTask [${topic || 'System Reasoning'}]:\n${query}${
      codeContext ? `\n\nCode Context:\n${codeContext}` : ''
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: fullPrompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text || 'No response generated.';

    res.json({
      answer: text,
      model: 'gemini-4-argon',
      thinkingLevel: 'HIGH',
    });
  } catch (error: any) {
    console.error('Error during high-thinking analysis:', error);
    res.status(500).json({
      error: error?.message || 'Failed to complete high-thinking architectural analysis',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`LJAC Architecture Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
