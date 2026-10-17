/**
 * Gideon AI Service — connects to the local Ollama backend (port 3010).
 * Uses Server-Sent Events (SSE) for real-time streaming responses.
 * Falls back to a non-streaming fetch if SSE fails.
 */

const BACKEND = import.meta.env.VITE_GIDEON_BACKEND || 'http://localhost:3010';

/** In-memory chat history sent as context on each request (max 20 turns). */
let _history = [];
const MAX_HISTORY = 20;

function _pushHistory(role, content) {
  _history.push({ role, content });
  if (_history.length > MAX_HISTORY * 2) {
    _history = _history.slice(-MAX_HISTORY * 2);
  }
}

const aiService = {
  /**
   * Reset conversation history (e.g. on new chat / Ghost Protocol).
   */
  clearHistory() {
    _history = [];
  },

  /**
   * Send a prompt to Gideon (streaming SSE → accumulates full text).
   * @param {string} prompt
   * @param {{ onToken?: (token: string) => void }} [opts]
   * @returns {Promise<{ success: boolean, action: string, message: string }>}
   */
  chat: async (prompt, opts = {}) => {
    const { onToken } = opts;

    _pushHistory('user', prompt);

    try {
      const response = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: _history.slice(0, -1), // exclude the message we just added
          stream: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(err.error || `Backend error ${response.status}`);
      }

      // ── SSE streaming ───────────────────────────────────────────────────
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.error) throw new Error(payload.error);
            if (payload.token) {
              fullText += payload.token;
              onToken?.(payload.token);
            }
            if (payload.done) break;
          } catch (parseErr) {
            // partial JSON — skip
          }
        }
      }

      _pushHistory('assistant', fullText);
      return { success: true, action: 'chat_response', message: fullText };

    } catch (err) {
      console.error('[aiService] Error:', err.message);
      // Remove the user message we added if the call failed
      _history = _history.filter((_, i) => i !== _history.length - 1);
      throw err;
    }
  },

  /**
   * Check backend + Ollama health.
   * @returns {Promise<{ status: string, model: string, availableModels: string[] }>}
   */
  healthCheck: async () => {
    const r = await fetch(`${BACKEND}/health`);
    return r.json();
  },
};

export default aiService;
