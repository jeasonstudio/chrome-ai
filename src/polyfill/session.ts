import { LlmInference, ProgressListener } from '@mediapipe/tasks-genai';
import {
  ChromeAIModelInfo,
  ChromeAISession,
  ChromeAISessionAvailable,
  ChromeAISessionOptions,
  ChromePromptAPI,
  PolyfillChromeAIOptions,
} from '../global';
import createDebug from 'debug';

const debug = createDebug('chromeai:polyfill');

class PolyfillChromeAISession implements ChromeAISession {
  public constructor(private llm: LlmInference) {
    debug('PolyfillChromeAISession created', llm);
  }

  public prompt = async (prompt: string): Promise<string> => {
    const response = await this.llm.generateResponse(prompt);
    debug('prompt', prompt, response);
    return response;
  };

  public promptStreaming = (prompt: string): ReadableStream<string> => {
    debug('promptStreaming', prompt);
    const stream = new ReadableStream<string>({
      start: (controller) => {
        const listener: ProgressListener = (
          partialResult: string,
          done: boolean
        ) => {
          controller.enqueue(partialResult);
          if (done) {
            controller.close();
          }
        };
        this.llm.generateResponse(prompt, listener);
      },
      cancel: (reason) => {
        console.warn('stream text canceled', reason);
      },
    });
    debug('promptStreaming', prompt);
    return stream;
  };

  public destroy = async () => this.llm.close();
}

/**
 * Model: https://huggingface.co/oongaboongahacker/Gemini-Nano
 */
export class PolyfillChromeAI implements ChromePromptAPI {
  private aiOptions: PolyfillChromeAIOptions = {
    wasmBinaryPath:
      'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/genai_wasm_internal.wasm',
    wasmLoaderPath:
      'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/genai_wasm_internal.js',
    // About 1.78GB, should cache by browser
    modelAssetPath:
      'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/gemini-nano-it-chrome-128.bin',
  };

  public constructor(aiOptions: Partial<PolyfillChromeAIOptions> = {}) {
    this.aiOptions = Object.assign(this.aiOptions, aiOptions);
    debug('PolyfillChromeAI created', this.aiOptions);
    this.modelAssetBuffer = fetch(this.aiOptions.modelAssetPath).then(
      (response) => response.body!.getReader()
    )!;
  }

  private modelAssetBuffer: Promise<ReadableStreamDefaultReader>;

  public canCreateTextSession = async (): Promise<ChromeAISessionAvailable> => {
    // If browser do not support WebAssembly/WebGPU, return 'no';
    if (typeof WebAssembly.instantiate !== 'function') return 'no';
    if (!(<any>navigator).gpu) return 'no';

    // Check if modelAssetBuffer is downloaded, if not, return 'after-download';
    const isModelAssetBufferReady = await Promise.race([
      this.modelAssetBuffer,
      Promise.resolve('sentinel'),
    ])
      .then((value) => value === 'sentinel')
      .catch(() => true);

    return isModelAssetBufferReady ? 'readily' : 'after-download';
  };

  public textModelInfo = async (): Promise<ChromeAIModelInfo> => ({
    defaultTemperature: 0.8,
    defaultTopK: 3,
    maxTopK: 128,
  });

  public createTextSession = async (
    options?: ChromeAISessionOptions
  ): Promise<ChromeAISession> => {
    const defaultParams = await this.textModelInfo();
    const argv = options ?? { temperature: 0.8, topK: 3 };
    const llm = await LlmInference.createFromOptions(
      {
        wasmLoaderPath: this.aiOptions.wasmLoaderPath!,
        wasmBinaryPath: this.aiOptions.wasmBinaryPath!,
      },
      {
        baseOptions: {
          modelAssetBuffer: await this.modelAssetBuffer,
        },
        temperature: argv.temperature,
        topK: argv.topK,
      }
    );
    const session = new PolyfillChromeAISession(llm);
    debug('createSession', options, session);
    return session;
  };
}

export const polyfillChromeAI = (
  options?: Partial<PolyfillChromeAIOptions>
) => {
  const ai = new PolyfillChromeAI(options);
  globalThis.ai = globalThis.ai || ai;
  globalThis.model = globalThis.model || ai;
};
