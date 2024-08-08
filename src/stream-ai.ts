import {
  LanguageModelV1CallOptions,
  LanguageModelV1StreamPart,
} from '@ai-sdk/provider';
import createDebug from 'debug';

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
        if (options.mode.type === 'object-json') {
          transforming =
            chunk.startsWith(objectStartSequence) &&
            !chunk.endsWith(objectStopSequence);
          chunk = chunk.replace(
            new RegExp('^' + objectStartSequence, 'ig'),
            ''
          );
          chunk = chunk.replace(new RegExp(objectStopSequence + '$', 'ig'), '');
        } else {
          transforming = true;
        }
        const textDelta = chunk.replace(buffer, ''); // See: https://github.com/jeasonstudio/chrome-ai/issues/11
        if (transforming) controller.enqueue({ type: 'text-delta', textDelta });
        buffer = chunk;
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
