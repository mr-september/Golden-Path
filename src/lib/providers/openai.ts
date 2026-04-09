import { ProviderConfig, BatchResult, AppError, ErrorCategory } from '../../types';

export async function processOpenAIBatch(
  config: ProviderConfig,
  prompt: string,
  onRetry?: (attempt: number, delay: number) => void
): Promise<BatchResult> {
  const maxRetries = 5;
  let attempt = 0;

  let baseUrl = config.baseUrl;
  if (!baseUrl) {
    if (config.type === 'openai') {
      baseUrl = 'https://api.openai.com/v1';
    } else if (config.type === 'openrouter') {
      baseUrl = 'https://openrouter.ai/api/v1';
    } else if (config.type === 'custom') {
      baseUrl = 'http://localhost:11434/v1'; // Default Ollama
    }
  }

  while (attempt < maxRetries) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          ...(config.type === 'openrouter' ? {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'GoldenPath'
          } : {})
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { 
              role: 'system', 
              content: "You are a technical archivist. Your goal is to maintain a cumulative 'Golden Path' document. You must be aggressive in removing failed instructions and replacing them with working ones found in later conversation batches. Focus on technical accuracy and instruction-oriented output." 
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
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
          message: errorData.error?.message || `OpenAI Error: ${response.status} ${response.statusText}`,
          code: response.status
        } as AppError;
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;
      if (!text) {
        throw new Error("Empty response from OpenAI provider.");
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
            message: `Endpoint unreachable: ${error.message}. Check your Base URL or local server status.`,
            raw: error
          } as AppError;
        }
        throw error;
      }
    }
  }

  throw new Error("Max retries exceeded.");
}
