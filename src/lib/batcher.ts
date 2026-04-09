import { Batch } from '../types';

/**
 * Heuristic: 1 token ≈ 4 characters.
 * This is a standard approximation for LLM token counting.
 */
const TOKENS_TO_CHARS = 4;
const SAFETY_BUFFER = 0.9; // 10% buffer to prevent overflow

/**
 * Higher-order batcher that handles segmentation and ceiling enforcement.
 * Systematically splits text into manageable chunks while preserving turn/line boundaries where possible.
 */
export function createBatches(
  text: string, 
  size: number, 
  tokenCeiling: number,
  mode: string = 'distiller',
  customTurnPattern: string = ''
): Batch[] {
  if (!text) return [];

  const charCeiling = Math.floor(tokenCeiling * TOKENS_TO_CHARS * SAFETY_BUFFER);
  
  let regex: RegExp | null = null;
  let useSizeLimit = true;

  if (customTurnPattern && customTurnPattern.trim() !== '') {
    try {
      regex = new RegExp(customTurnPattern, 'mi');
    } catch (e) {
      console.warn("Invalid custom regex pattern, falling back to mode heuristic", e);
    }
  }

  if (!regex) {
    if (mode === 'distiller') {
      regex = /(?=User:|Gemini:|Human:|Assistant:|ChatGPT:|Claude:|You:)/i;
    } else if (mode === 'minutes') {
      regex = /(?=\[[0-9]{2}:[0-9]{2}:[0-9]{2}\])|(?=^[A-Z][a-z]+: |^[A-Z\s]+: )/m;
    } else if (mode === 'docs' || mode === 'repo') {
      useSizeLimit = false;
      regex = /(?=\n--- FILE: .* ---)/;
    } else {
      // custom mode without customTurnPattern
      useSizeLimit = false;
    }
  }

  let segments: string[] = [];

  if (regex) {
    segments = text.split(regex);
  }

  if (segments.length <= 1) {
    useSizeLimit = false;
    segments = text.split(/(?=\n\n|\n#{1,3} )/);
    if (segments.length <= 1) {
      segments = text.split('\n').map(l => l + '\n');
    }
    segments = segments.filter(l => l.trim().length > 0);
  }

  const newBatches: Batch[] = [];
  let currentContent = '';
  let currentCount = 0;
  let currentId = 0;

  const flush = () => {
    if (currentContent.length > 0) {
      newBatches.push({ id: currentId++, content: currentContent, status: 'pending' });
      currentContent = '';
      currentCount = 0;
    }
  };

  for (const segment of segments) {
    // Hard break if a single segment (turn or line) exceeds the ceiling
    if (segment.length > charCeiling) {
      flush();
      for (let j = 0; j < segment.length; j += charCeiling) {
        newBatches.push({ 
          id: currentId++, 
          content: segment.substring(j, j + charCeiling), 
          status: 'pending' 
        });
      }
      continue;
    }

    const wouldExceedCeiling = currentContent.length + segment.length > charCeiling;
    const wouldExceedSize = useSizeLimit && (currentCount + 1 > size);

    if (wouldExceedCeiling || wouldExceedSize) {
      flush();
    }
    
    currentContent += segment;
    currentCount++;
  }

  flush();
  return newBatches;
}
