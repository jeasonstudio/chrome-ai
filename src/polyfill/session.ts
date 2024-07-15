import {
  FilesetResolver,
  LlmInference,
  ProgressListener,
} from '@mediapipe/tasks-genai';
import {
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

  private generateText = async (prompt: string): Promise<string> => {
    const response = await this.llm.generateResponse(prompt);
    debug('generateText', prompt, response);
    return response;
  };

  private streamText = (prompt: string): ReadableStream<string> => {
    debug('streamText', prompt);
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
    debug('streamText', prompt);
    return stream;
  };

  public destroy = async () => this.llm.close();
  public prompt = this.generateText;
  public execute = this.generateText;
  public promptStreaming = this.streamText;
  public executeStreaming = this.streamText;
}

/**
 * Model: https://huggingface.co/oongaboongahacker/Gemini-Nano
 */
export class PolyfillChromeAI implements ChromePromptAPI {
  private aiOptions: PolyfillChromeAIOptions = {
    // About 1.78GB, should cache by browser
    llmModelAssetPath:
      'https://huggingface.co/oongaboongahacker/Gemini-Nano/resolve/main/weights.bin',
    filesetBasePath: 'https://unpkg.com/@mediapipe/tasks-genai/wasm/',
  };

  public constructor(aiOptions: Partial<PolyfillChromeAIOptions> = {}) {
    this.aiOptions = Object.assign(this.aiOptions, aiOptions);
    debug('PolyfillChromeAI created', this.aiOptions);
    this.modelAssetBuffer = fetch(this.aiOptions.llmModelAssetPath).then(
      (response) => response.body!.getReader()
    )!;
  }

  private modelAssetBuffer: Promise<ReadableStreamDefaultReader>;

  private canCreateSession = async (): Promise<ChromeAISessionAvailable> => {
    // TODO@jeasonstudio:
    // * if browser do not support WebAssembly/WebGPU, return 'no';
    // * check if modelAssetBuffer is downloaded, if not, return 'after-download';
    return 'readily';
  };
  private defaultSessionOptions =
    async (): Promise<ChromeAISessionOptions> => ({
      temperature: 0.800000011920929,
      topK: 3,
    });

  private createSession = async (
    options?: ChromeAISessionOptions
  ): Promise<ChromeAISession> => {
    const argv = options ?? (await this.defaultSessionOptions());
    const fileset = await FilesetResolver.forGenAiTasks(
      this.aiOptions.filesetBasePath
    );
    const llm = await LlmInference.createFromOptions(fileset, {
      baseOptions: {
        modelAssetBuffer: await this.modelAssetBuffer,
      },
      temperature: argv.temperature,
      topK: argv.topK,
    });
    const session = new PolyfillChromeAISession(llm);
    debug('createSession', options, session);
    return session;
  };


  public canCreateTextSession = this.canCreateSession;
  public defaultTextSessionOptions = this.defaultSessionOptions;
  public createTextSession = this.createSession;
}

export const polyfillChromeAI = (
  options?: Partial<PolyfillChromeAIOptions>
) => {
  const ai = new PolyfillChromeAI(options);
  globalThis.ai = globalThis.ai || ai;
  globalThis.model = globalThis.model || ai;
};
