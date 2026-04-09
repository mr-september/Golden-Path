import { ProviderConfig, BatchResult } from '../../types';
import { processGeminiBatch } from './gemini';
import { processOpenAIBatch } from './openai';
import { processAnthropicBatch } from './anthropic';

export async function processBatch(
  config: ProviderConfig,
  previousSummary: string,
  previousBatchContent: string,
  currentBatch: string,
  batchIndex: number,
  totalBatches: number,
  promptTemplate: string,
  onRetry?: (attempt: number, delay: number) => void
): Promise<BatchResult> {
  const prompt = promptTemplate
    .replace('{{previousSummary}}', previousSummary || "None yet.")
    .replace('{{previousBatch}}', previousBatchContent || "This is the first batch.")
    .replace('{{currentBatch}}', currentBatch)
    .replace('{{batchIndex}}', (batchIndex + 1).toString())
    .replace('{{totalBatches}}', totalBatches.toString());

  switch (config.type) {
    case 'gemini':
      return processGeminiBatch(config, prompt, onRetry);
    case 'openai':
    case 'openrouter':
    case 'custom':
      return processOpenAIBatch(config, prompt, onRetry);
    case 'anthropic':
      return processAnthropicBatch(config, prompt, onRetry);
    default:
      throw new Error(`Unsupported provider: ${config.type}`);
  }
}
