import {
  LanguageModelV1CallOptions,
  LanguageModelV1StreamPart,
} from '@ai-sdk/provider';
import createDebug from 'debug';
import { extractJSON } from './extract-json';

const debug = createDebug('chromeai');

export const objectStartSequence = ' ```json\n';
export const objectStopSequence = '\n```';

export class StreamAI extends TransformStream<
  string,
  LanguageModelV1StreamPart
> {
  public constructor(options: LanguageModelV1CallOptions) {
    let buffer = '';
    let transforming = false;

    const reset = () => {
      buffer = '';
      transforming = false;
    };

    super({
      start: (controller) => {
        reset();
        if (!options.abortSignal) return;
        options.abortSignal.addEventListener('abort', () => {
          debug('streamText terminate by abortSignal');
          controller.terminate();
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
        debug('stream result:', buffer);
      },
    });
  }
}
