import { describe, it, expect, vi, afterEach } from 'vitest';
import { ChromeAIChatLanguageModel } from './index';
import { generateText, streamText, generateObject, streamObject } from 'ai';
import {
  LoadSettingError,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';
import { z } from 'zod';

describe('language-model', () => {
  // Reset all stubs after each test
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should instantiation anyways', () => {
    expect(new ChromeAIChatLanguageModel('text')).toBeInstanceOf(
      ChromeAIChatLanguageModel
    );
    expect(new ChromeAIChatLanguageModel('text').modelId).toBe('text');
    expect(
      new ChromeAIChatLanguageModel('text', { temperature: 1, topK: 10 })
        .options
    ).toMatchObject({ temperature: 1, topK: 10 });
  });

  it('should throw when not support', async () => {
    await expect(() =>
      generateText({
        model: new ChromeAIChatLanguageModel('text'),
        prompt: 'empty',
      })
    ).rejects.toThrowError(LoadSettingError);

    const capabilities = vi.fn(async () => 'no');
    vi.stubGlobal('ai', {
      assistant: {
        capabilities,
      },
    });

    await expect(() =>
      generateText({
        model: new ChromeAIChatLanguageModel('text'),
        prompt: 'empty',
      })
    ).rejects.toThrowError(LoadSettingError);
    expect(capabilities).toHaveBeenCalledTimes(1);

    await expect(() =>
      generateText({
        model: new ChromeAIChatLanguageModel('text'),
        prompt: 'empty',
      })
    ).rejects.toThrowError(LoadSettingError);
    expect(capabilities).toHaveBeenCalledTimes(2);
  });

  it('should do generate text', async () => {
    const capabilities = vi.fn(async () => ({
      defaultTemperature: 1,
      defaultTopK: 10,
      maxTopK: 128,
      available: 'readily',
    }));
    const prompt = vi.fn(async (prompt: string) => prompt);
    const create = vi.fn(async () => ({ prompt }));
    vi.stubGlobal('ai', {
      assistant: {
        capabilities,
        create,
      },
    });

    await generateText({
      model: new ChromeAIChatLanguageModel('text'),
      prompt: 'test',
    });

    const result = await generateText({
      model: new ChromeAIChatLanguageModel('text'),
      prompt: 'test',
    });
    expect(result).toMatchObject({
      finishReason: 'stop',
      text: 'test',
    });

    const resultForMessages = await generateText({
      model: new ChromeAIChatLanguageModel('text'),
      messages: [
        { role: 'user', content: 'test' },
        { role: 'assistant', content: 'assistant' },
      ],
    });
    expect(resultForMessages.text).toBe(
      'user\ntest\nmodel\nassistant\nmodel\n'
    );
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
      assistant: {
        capabilities: vi.fn(async () => ({
          defaultTemperature: 1,
          defaultTopK: 10,
          maxTopK: 128,
          available: 'readily',
        })),
        create: vi.fn(async () => ({ promptStreaming })),
      },
    });

    const result = await streamText({
      model: new ChromeAIChatLanguageModel('text'),
      prompt: 'test',
    });
    for await (const textPart of result.textStream) {
      expect(textPart).toBe('test');
    }
  });

  it('should do generate object', async () => {
    const prompt = vi.fn(async (prompt: string) => '{"hello":"world"}');
    vi.stubGlobal('ai', {
      assistant: {
        capabilities: vi.fn(async () => ({
          defaultTemperature: 1,
          defaultTopK: 10,
          maxTopK: 128,
          available: 'readily',
        })),
        create: vi.fn(async () => ({ prompt })),
      },
    });

    const { object } = await generateObject({
      model: new ChromeAIChatLanguageModel('text'),
      schema: z.object({
        hello: z.string(),
      }),
      prompt: 'test',
    });

    expect(object).toMatchObject({ hello: 'world' });
  });

  it('should throw when tool call', async () => {
    const prompt = vi.fn(async (prompt: string) => prompt);
    vi.stubGlobal('ai', {
      assistant: {
        capabilities: vi.fn(async () => ({
          defaultTemperature: 1,
          defaultTopK: 10,
          maxTopK: 128,
          available: 'readily',
        })),
        create: vi.fn(async () => ({ prompt })),
      },
    });
    await expect(() =>
      generateText({
        model: new ChromeAIChatLanguageModel('text'),
        messages: [
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: '1',
                toolName: 'test',
                result: null,
              },
            ],
          },
        ],
      })
    ).rejects.toThrowError(UnsupportedFunctionalityError);

    const model = new ChromeAIChatLanguageModel('text', { temperature: 1 });
    (model as any).session = { prompt };
    const result = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [],
        },
      ],
    });
    expect(result.text).toBe('user\n\nmodel\n');

    await expect(() =>
      generateObject({
        model: new ChromeAIChatLanguageModel('text'),
        mode: 'tool',
        schema: z.object({}),
        prompt: 'test',
      })
    ).rejects.toThrowError(UnsupportedFunctionalityError);

    await expect(() =>
      streamObject({
        model: new ChromeAIChatLanguageModel('text'),
        mode: 'tool',
        schema: z.object({}),
        prompt: 'test',
      })
    ).rejects.toThrowError(UnsupportedFunctionalityError);
  });
});
