import { GEMINI_BASE_URL, TRANSLATION_PROMPT_TEMPLATE, GENERATION_CONFIG } from '../constants';

export class GeminiApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

export async function* streamTranslation(
  apiKey: string,
  text: string,
  model: string,
): AsyncGenerator<string, void, unknown> {
  const url = `${GEMINI_BASE_URL}${model}:streamGenerateContent?alt=sse`;
  const prompt = TRANSLATION_PROMPT_TEMPLATE + text;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: GENERATION_CONFIG.temperature,
        maxOutputTokens: GENERATION_CONFIG.maxOutputTokens,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: { message?: string } }).error?.message || response.statusText;
    throw new GeminiApiError(response.status, `${response.status}: ${msg}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;
      try {
        const data = JSON.parse(jsonStr);
        const chunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunk) yield chunk;
      } catch {
        // skip malformed chunks
      }
    }
  }
}
