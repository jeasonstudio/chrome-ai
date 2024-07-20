import { LanguageModelV1StreamPart } from '@ai-sdk/provider';
import createDebug from 'debug';
import { extractJSON } from './extract-json';

const debug = createDebug('chromeai');

export class StreamAI extends TransformStream<
  string,
  LanguageModelV1StreamPart
> {
  public constructor(abortSignal?: AbortSignal) {
    let textTemp = '';
    super({
      start: (controller) => {
        textTemp = '';
        if (!abortSignal) return;
        abortSignal.addEventListener('abort', () => {
          debug('streamText terminate by abortSignal');
          controller.terminate();
          textTemp = '';
        });
      },
      transform: (chunk, controller) => {
        const jsonPart = extractJSON(chunk);
        const textDelta = jsonPart.replace(textTemp, "");
        textTemp += textDelta;
        controller.enqueue({ type: 'text-delta', textDelta });
      },
      flush: (controller) => {
        controller.enqueue({
          type: 'finish',
          finishReason: 'stop',
          usage: { completionTokens: 0, promptTokens: 0 },
        });
        debug('stream result:', textTemp);
        textTemp = '';
      },
    });
  }
}
