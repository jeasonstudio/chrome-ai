import { LanguageModelV1StreamPart } from '@ai-sdk/provider';
import createDebug from 'debug';

const debug = createDebug('chromeai');

export class StreamAI extends TransformStream<
  string,
  LanguageModelV1StreamPart
> {
  public constructor() {
    let textTemp = '';
    super({
      start: () => {
        textTemp = '';
      },
      transform: (chunk, controller) => {
        const textDelta = chunk.replace(textTemp, '');
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
