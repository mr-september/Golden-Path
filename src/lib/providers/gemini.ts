import { GoogleGenAI } from "@google/genai";
import { ProviderConfig, BatchResult, AppError, ErrorCategory } from '../../types';

export async function processGeminiBatch(
  config: ProviderConfig,
  prompt: string,
  onRetry?: (attempt: number, delay: number) => void
): Promise<BatchResult> {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: config.model || "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a technical archivist. Your goal is to maintain a cumulative 'Golden Path' document. You must be aggressive in removing failed instructions and replacing them with working ones found in later conversation batches. Focus on technical accuracy and instruction-oriented output.",
          maxOutputTokens: 4096,
          temperature: 0.1,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      return { text, attempts: attempt };
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }

      const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.toLowerCase().includes('quota');
      const isServerError = error.status >= 500 || error.message?.includes('500');

      if (isRateLimit || isServerError) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        if (onRetry) onRetry(attempt, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        let category: ErrorCategory = 'UNKNOWN';
        let message = error.message || 'Gemini Error';
        
        if (message.includes('401') || message.includes('403') || message.toLowerCase().includes('api key')) {
          category = 'AUTH';
        } else if (message.includes('404')) {
          category = 'CONFIG';
        } else if (message.includes('429')) {
          category = 'QUOTA';
        } else if (message.includes('500')) {
          category = 'SERVER';
        } else if (error instanceof TypeError || message.toLowerCase().includes('fetch')) {
          category = 'NETWORK';
        }

        throw {
          category,
          message,
          raw: error
        } as AppError;
      }
    }
  }

  throw new Error("Max retries exceeded.");
}
