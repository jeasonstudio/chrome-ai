// https://github.com/explainers-by-googlers/prompt-api

import { ChromeAICapabilityAvailability } from './enum';

export interface ChromeAIAssistantCapabilities {
  /**
   * the availability of the capability
   */
  available: ChromeAICapabilityAvailability;
  /**
   * the default temperature for the capability
   */
  defaultTemperature: number;
  /**
   * the default top k for the capability
   */
  defaultTopK: number;
  /**
   * the maximum top k for the capability
   */
  maxTopK: number;
}

export interface ChromeAIAssistantCreateOptions extends Record<string, any> {
  temperature?: number;
  topK?: number;
}

export interface ChromeAIAssistant {
  destroy: () => Promise<void>;
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (prompt: string) => ReadableStream<string>;
}

export interface ChromeAIAssistantFactory {
  capabilities: () => Promise<ChromeAIAssistantCapabilities>;
  create: (
    options?: ChromeAIAssistantCreateOptions
  ) => Promise<ChromeAIAssistant>;
}

export interface ChromePromptAPI extends Record<string, any> {
  assistant: ChromeAIAssistantFactory;
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
