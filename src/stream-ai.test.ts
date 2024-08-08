import { describe, it, expect } from 'vitest';
import { StreamAI } from './stream-ai';
import type { LanguageModelV1CallOptions } from '@ai-sdk/provider';

describe('stream-ai', async () => {
  const defaultOptions: LanguageModelV1CallOptions = {
    prompt: [],
    mode: { type: 'regular' },
    inputFormat: 'messages',
  };
  it('should correctly transform', async () => {
    const transformStream = new StreamAI(defaultOptions);

    const writer = transformStream.writable.getWriter();
    writer.write('hello');
    writer.write('helloworld');
    writer.close();

    const reader = transformStream.readable.getReader();
    expect(await reader.read()).toMatchObject({
      value: { type: 'text-delta', textDelta: 'hello' },
      done: false,
    });
    expect(await reader.read()).toMatchObject({
      value: { type: 'text-delta', textDelta: 'world' },
      done: false,
    });
    expect(await reader.read()).toMatchObject({
      value: { type: 'finish' },
    });
  });

  it('should abort when signal', async () => {
    const controller = new AbortController();
    const transformStream = new StreamAI({
      ...defaultOptions,
      abortSignal: controller.signal,
    });

    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

    writer.write('hello');

    expect(await reader.read()).toMatchObject({
      value: { type: 'text-delta', textDelta: 'hello' },
      done: false,
    });

    controller.abort();
    expect(await reader.read()).toMatchObject({ done: true });
  });

  it('should transform when object-json', async () => {
    const transformStream = new StreamAI({
      ...defaultOptions,
      mode: { type: 'object-json', schema: {} },
    });

    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

    for (const chunk of [
      ' ```',
      ' ```json\n',
      ' ```json\n{}',
      ' ```json\n{}\n```',
    ]) {
      writer.write(chunk);
    }
    writer.close();

    let output = '';
    while (true) {
      const item = await reader.read();
      if (item.done || item.value?.type === 'finish') break;
      if (item.value?.type === 'text-delta') {
        output += item.value.textDelta;
      }
    }

    expect(output).toBe('{}');
  });
});
