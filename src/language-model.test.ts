import { describe, it, expect, vi, afterEach } from 'vitest';
import { chromeai, ChromeAIChatLanguageModel } from './language-model';
import { generateText, streamText, generateObject } from 'ai';
import { LoadSettingError } from '@ai-sdk/provider';
import { z } from 'zod';

describe('chrome-ai', () => {
  // Reset all stubs after each test
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should instantiation anyways', () => {
    expect(chromeai()).toBeInstanceOf(ChromeAIChatLanguageModel);
    expect(chromeai().modelId).toBe('generic');
    expect(chromeai('text').modelId).toBe('text');
    expect(
      chromeai('text', { temperature: 1, topK: 10 }).options
    ).toMatchObject({ temperature: 1, topK: 10 });
  });

  it('should throw when not support', async () => {
    await expect(() =>
      generateText({ model: chromeai(), prompt: 'empty' })
    ).rejects.toThrowError(LoadSettingError);

    const cannotCreateSession = vi.fn(async () => 'no');
    vi.stubGlobal('ai', {
      canCreateTextSession: cannotCreateSession,
      canCreateGenericSession: cannotCreateSession,
    });

    await expect(() =>
      generateText({ model: chromeai('text'), prompt: 'empty' })
    ).rejects.toThrowError(LoadSettingError);
    expect(cannotCreateSession).toHaveBeenCalledTimes(1);

    await expect(() =>
      generateText({ model: chromeai('generic'), prompt: 'empty' })
    ).rejects.toThrowError(LoadSettingError);
    expect(cannotCreateSession).toHaveBeenCalledTimes(2);
  });

  it('should do generate text', async () => {
    const canCreateSession = vi.fn(async () => 'readily');
    const getOptions = vi.fn(async () => ({ temperature: 1, topK: 10 }));
    const prompt = vi.fn(async (prompt: string) => prompt);
    const createSession = vi.fn(async () => ({ prompt }));
    vi.stubGlobal('ai', {
      canCreateGenericSession: canCreateSession,
      canCreateTextSession: canCreateSession,
      defaultGenericSessionOptions: getOptions,
      defaultTextSessionOptions: getOptions,
      createGenericSession: createSession,
      createTextSession: createSession,
    });

    await generateText({ model: chromeai('text'), prompt: 'test' });
    expect(getOptions).toHaveBeenCalledTimes(1);

    const result = await generateText({ model: chromeai(), prompt: 'test' });
    expect(result).toMatchObject({
      finishReason: 'stop',
      text: 'user:\ntest\n\nmodel:\n',
    });
  });

  it('should do stream text', async () => {
    const promptStreaming = vi.fn((prompt: string) => {
      const stream = new ReadableStream<string>({
        start(controller) {
          controller.enqueue(prompt);
          controller.close();
        },
      });
      return stream;
    });
    vi.stubGlobal('ai', {
      canCreateGenericSession: vi.fn(async () => 'readily'),
      defaultGenericSessionOptions: vi.fn(async () => ({})),
      createGenericSession: vi.fn(async () => ({ promptStreaming })),
    });

    const result = await streamText({ model: chromeai(), prompt: 'test' });
    for await (const textPart of result.textStream) {
      expect(textPart).toBe('user:\ntest\n\nmodel:\n');
    }
  });

  it('should do generate object', async () => {
    const prompt = vi.fn(async (prompt: string) => '{"hello":"world"}');
    vi.stubGlobal('ai', {
      canCreateGenericSession: vi.fn(async () => 'readily'),
      defaultGenericSessionOptions: vi.fn(async () => ({})),
      createGenericSession: vi.fn(async () => ({ prompt })),
    });

    const { object } = await generateObject({
      model: chromeai(),
      schema: z.object({
        hello: z.string(),
      }),
      prompt: 'test',
    });

    expect(object).toMatchObject({ hello: 'world' });
  });
});
