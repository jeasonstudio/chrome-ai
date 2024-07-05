import { describe, it, expect } from 'vitest';
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

  it('should abort when signal', async () => {
    const controller = new AbortController();
    const transformStream = new StreamAI(controller.signal);

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
});
