export type ChromeAISessionAvailable = 'no' | 'after-download' | 'readily';

export interface ChromeAISessionOptions {
  temperature?: number;
  topK?: number;
}

export interface ChromeAISession {
  destroy: () => Promise<void>;
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (prompt: string) => ReadableStream<string>;
}

export interface ChromePromptAPI {
  canCreateTextSession: () => Promise<ChromeAISessionAvailable>;
  defaultTextSessionOptions: () => Promise<ChromeAISessionOptions>;
  createTextSession: (
    options?: ChromeAISessionOptions
  ) => Promise<ChromeAISession>;
}

export interface PolyfillChromeAIOptions {
  modelAssetPath: string;
  wasmLoaderPath: string;
  wasmBinaryPath: string;
}

declare global {
  var ai: ChromePromptAPI;
  var model = ai;
  var __polyfill_ai_options__: Partial<PolyfillChromeAIOptions> | undefined;
}
