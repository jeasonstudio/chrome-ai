import { describe, it, expect } from 'vitest';
import { chromeai } from './chromeai';

describe('chromeai', () => {
  it('should correctly create instance', async () => {
    expect(chromeai().modelId).toBe('text');
    expect(chromeai('text').modelId).toBe('text');
    expect(chromeai('embedding').modelId).toBe('embedding');
    expect(chromeai.embedding().modelId).toBe('embedding');
  });
});
