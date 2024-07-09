export type ChromeAISessionAvailable = 'no' | 'after-download' | 'readily';

export interface ChromeAISessionOptions {
  temperature?: number;
  topK?: number;
}

export interface ChromeAISession {
  destroy: () => Promise<void>;
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (prompt: string) => ReadableStream<string>;
  execute: (prompt: string) => Promise<string>;
  executeStreaming: (prompt: string) => ReadableStream<string>;
}

export interface ChromePromptAPI {
  canCreateGenericSession: () => Promise<ChromeAISessionAvailable>;
  canCreateTextSession: () => Promise<ChromeAISessionAvailable>;
  defaultGenericSessionOptions: () => Promise<ChromeAISessionOptions>;
  defaultTextSessionOptions: () => Promise<ChromeAISessionOptions>;
  createGenericSession: (
    options?: ChromeAISessionOptions
  ) => Promise<ChromeAISession>;
  createTextSession: (
    options?: ChromeAISessionOptions
  ) => Promise<ChromeAISession>;
}

export interface PolyfillChromeAIOptions {
  llmModelAssetPath: string;
  filesetBasePath: string;
}

declare global {
  var ai: ChromePromptAPI;
  var model = ai;
  var __polyfill_ai_options__: Partial<PolyfillChromeAIOptions> | undefined;
}
