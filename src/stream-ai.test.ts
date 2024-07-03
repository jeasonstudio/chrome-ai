import { describe, it, expect, vi, afterEach } from 'vitest';
import { StreamAI } from './stream-ai';

describe('stream-ai', () => {
  it('should correctly transform', async () => {
    const transformStream = new StreamAI();

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
});
