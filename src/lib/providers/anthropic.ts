import { ProviderConfig, BatchResult, AppError, ErrorCategory } from '../../types';

export async function processAnthropicBatch(
  config: ProviderConfig,
  prompt: string,
  onRetry?: (attempt: number, delay: number) => void
): Promise<BatchResult> {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // NOTE: Using a proxy or direct fetch depending on environment.
      // browser-based fetch to Anthropic usually needs a CORS proxy or is handled by a backend.
      // But for a local tool/developer use, we'll try direct or assume user knows.
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true' // Some libraries use this, direct fetch doesn't
        },
        body: JSON.stringify({
          model: config.model,
          system: "You are a technical archivist. Your goal is to maintain a cumulative 'Golden Path' document. You must be aggressive in removing failed instructions and replacing them with working ones found in later conversation batches. Focus on technical accuracy and instruction-oriented output.",
          messages: [
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          max_tokens: 4096,
          temperature: 0.1,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let category: ErrorCategory = 'UNKNOWN';
        if (response.status === 401 || response.status === 403) category = 'AUTH';
        if (response.status === 404) category = 'CONFIG';
        if (response.status === 429) category = 'QUOTA';
        if (response.status >= 500) category = 'SERVER';

        throw {
          category,
          message: errorData.error?.message || `Anthropic Error: ${response.status} ${response.statusText}`,
          code: response.status
        } as AppError;
      }

      const data = await response.json();
      const text = data.content[0]?.text;
      if (!text) {
        throw new Error("Empty response from Anthropic.");
      }

      return { text, attempts: attempt };
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }

      const isRateLimit = error.message?.includes('429') || error.status === 429;
      const isServerError = error.status >= 500;

      if (isRateLimit || isServerError) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        if (onRetry) onRetry(attempt, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        if (error instanceof TypeError) {
          throw {
            category: 'NETWORK',
            message: `Anthropic API unreachable: ${error.message}.`,
            raw: error
          } as AppError;
        }
        throw error;
      }
    }
  }

  throw new Error("Max retries exceeded.");
}
