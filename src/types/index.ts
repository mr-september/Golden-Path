export interface Batch {
  id: number;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'retrying';
  result?: string;
  retryAttempt?: number;
  retryDelay?: number;
}

export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'custom';

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface BatchResult {
  text: string;
  attempts: number;
}

export type ApiStatus = 'healthy' | 'quota_limit' | 'error' | 'idle';

export interface DistillerMode {
  id: string;
  name: string;
  icon: any;
  description: string;
  prompt: string;
  allowedExtensions?: string[];
}
export interface MultiFileSource {
  id: string;
  name: string;
  content: string;
  lastModified: number;
  size: number;
}

export type SortMode = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'custom';

export type ErrorCategory = 'AUTH' | 'NETWORK' | 'QUOTA' | 'SERVER' | 'CONFIG' | 'UNKNOWN';

export interface AppError {
  category: ErrorCategory;
  message: string;
  code?: string | number;
  raw?: any;
}

