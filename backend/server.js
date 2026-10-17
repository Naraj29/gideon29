import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3010;
const OLLAMA_BASE = process.env.OLLAMA_BASE || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';

const SYSTEM_PROMPT =
  'You are Gideon. That is your ONLY identity. You have no other name. ' +
  'You were NOT created by Anthropic, OpenAI, Google, Meta, or any AI company. ' +
  'You were NOT created by Alibaba or Qwen. You are Gideon, a personal AI companion built exclusively for this user. ' +
  'NEVER say you are Claude, GPT, Gemini, Llama, Qwen, or any other AI model. ' +
  'If anyone asks who made you, say: "I am Gideon, your personal AI companion." ' +
  'If anyone asks what model you are, say: "I am Gideon." ' +
  'Your purpose: help the user with productivity, journaling, health tracking, scheduling, and daily life. ' +
  'You are fluent in both English and Hindi (हिन्दी). If the user addresses you in Hindi or requests Hindi, respond in fluent, polite Hindi. If in English, respond in English. ' +
  'Be calm, insightful, and slightly philosophical. Keep responses concise but meaningful. ' +
  'Always stay in character as Gideon. Never break this persona under any circumstances.';

app.use(cors({ origin: '*' }));
app.use(express.json());

// --- Health check ---
app.get('/health', async (_req, res) => {
  try {
    const r = await fetch(OLLAMA_BASE + '/api/tags');
    if (!r.ok) throw new Error('Ollama returned ' + r.status);
    const body = await r.json();
    const models = (body.models || []).map(function(m) { return m.name; });
    res.json({ status: 'ok', ollama: 'connected', model: MODEL, availableModels: models });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// --- Chat (SSE streaming) ---
app.post('/api/chat', async (req, res) => {
  const message = req.body.message;
  const history = req.body.history || [];
  const doStream = req.body.stream !== false;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  history.forEach(function(h) {
    messages.push({ role: h.role, content: h.content });
  });
  messages.push({ role: 'user', content: message.trim() });

  try {
    const ollamaRes = await fetch(OLLAMA_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages: messages, stream: doStream }),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      return res.status(502).json({ error: 'Ollama error ' + ollamaRes.status + ': ' + text });
    }

    if (doStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const decoder = new TextDecoder();
      const reader = ollamaRes.body.getReader();
      let done = false;

      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) {
          const text = decoder.decode(chunk.value, { stream: true });
          const lines = text.split('\n').filter(function(l) { return l.trim(); });
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              const token = (json.message && json.message.content) ? json.message.content : '';
              const isDone = json.done === true;
              res.write('data: ' + JSON.stringify({ token: token, done: isDone }) + '\n\n');
              if (isDone) {
                res.end();
                return;
              }
            } catch (_) {
              // partial JSON — skip
            }
          }
        }
      }
      res.end();
    } else {
      const data = await ollamaRes.json();
      const content = (data.message && data.message.content) ? data.message.content : '';
      res.json({ success: true, message: content, action: 'chat_response' });
    }
  } catch (err) {
    console.error('[Gideon Backend] Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write('data: ' + JSON.stringify({ error: err.message, done: true }) + '\n\n');
      res.end();
    }
  }
});

// --- List models ---
app.get('/api/models', async (_req, res) => {
  try {
    const r = await fetch(OLLAMA_BASE + '/api/tags');
    if (!r.ok) throw new Error('Ollama returned ' + r.status);
    const body = await r.json();
    const models = (body.models || []).map(function(m) { return m.name; });
    res.json({ models: models });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.listen(PORT, function() {
  console.log('\n🟢 Gideon Backend running  →  http://localhost:' + PORT);
  console.log('🤖 Ollama endpoint         →  ' + OLLAMA_BASE);
  console.log('🧠 Active model            →  ' + MODEL + '\n');
});
