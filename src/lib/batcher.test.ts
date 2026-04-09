import { describe, it, expect } from 'vitest';
import { createBatches } from './batcher';

describe('createBatches', () => {
  const sampleTurnText = `User: Hello
Gemini: Hi there! How can I help?
User: I need to fix my code.
Gemini: Sure, show me the code.`;

  it('should split text by turns correctly', () => {
    const batches = createBatches(sampleTurnText, 2, 100);
    expect(batches.length).toBe(2);
    expect(batches[0].content).toContain('User: Hello');
    expect(batches[0].content).toContain('Gemini: Hi there!');
    expect(batches[1].content).toContain('User: I need to fix');
  });

  it('should fallback to line splitting if no turns are detected', () => {
    const rawLog = `Line 1: error
Line 2: warning
Line 3: success`;
    const batches = createBatches(rawLog, 1, 10); // Very small ceiling to force split
    expect(batches.length).toBeGreaterThan(1);
    expect(batches[0].content).toContain('Line 1');
  });

  it('should split giant turns that exceed the token ceiling', () => {
    const giantTurn = "User: " + "a".repeat(1000);
    const batches = createBatches(giantTurn, 10, 50); // 50 tokens * 4 = 200 chars
    expect(batches.length).toBeGreaterThan(1);
    batches.forEach(b => {
      expect(b.content.length).toBeLessThanOrEqual(200);
    });
  });

  it('should handle empty input gracefully', () => {
    const batches = createBatches('', 10, 1000);
    expect(batches).toEqual([]);
  });
});
