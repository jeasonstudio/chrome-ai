import {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1ImagePart,
  LanguageModelV1LogProbs,
  LanguageModelV1Prompt,
  LanguageModelV1StreamPart,
  LanguageModelV1TextPart,
  LanguageModelV1ToolCallPart,
  LanguageModelV1ToolResultPart,
  LoadSettingError,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';
import { ChromeAISession, ChromeAISessionOptions } from './global';
import createDebug from 'debug';
import { StreamAI } from './stream-ai';
import { chromeEmbedding } from './embedding-model';

const debug = createDebug('chromeai');

export type ChromeAIChatModelId = 'text' | 'generic';

export interface ChromeAIChatSettings extends Record<string, unknown> {
  temperature?: number;
  /**
   * Optional. The maximum number of tokens to consider when sampling.
   *
   * Models use nucleus sampling or combined Top-k and nucleus sampling.
   * Top-k sampling considers the set of topK most probable tokens.
   * Models running with nucleus sampling don't allow topK setting.
   */
  topK?: number;

  /**
   * Optional. A list of unique safety settings for blocking unsafe content.
   * @note this is not working yet
   */
  safetySettings?: Array<{
    category:
      | 'HARM_CATEGORY_HATE_SPEECH'
      | 'HARM_CATEGORY_DANGEROUS_CONTENT'
      | 'HARM_CATEGORY_HARASSMENT'
      | 'HARM_CATEGORY_SEXUALLY_EXPLICIT';

    threshold:
      | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
      | 'BLOCK_LOW_AND_ABOVE'
      | 'BLOCK_MEDIUM_AND_ABOVE'
      | 'BLOCK_ONLY_HIGH'
      | 'BLOCK_NONE';
  }>;
}

function getStringContent(
  content:
    | string
    | (LanguageModelV1TextPart | LanguageModelV1ImagePart)[]
    | (LanguageModelV1TextPart | LanguageModelV1ToolCallPart)[]
    | LanguageModelV1ToolResultPart[]
): string {
  if (typeof content === 'string') {
    return content.trim();
  } else if (Array.isArray(content) && content.length > 0) {
    const [first] = content;
    if (first.type !== 'text') {
      throw new UnsupportedFunctionalityError({ functionality: 'toolCall' });
    }
    return first.text.trim();
  } else {
    return '';
  }
}

export class ChromeAIChatLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = 'v1';
  readonly defaultObjectGenerationMode = 'json';
  readonly modelId: ChromeAIChatModelId = 'generic';
  readonly provider = 'gemini-nano';
  options: ChromeAIChatSettings;

  constructor(
    modelId: ChromeAIChatModelId,
    options: ChromeAIChatSettings = {}
  ) {
    this.modelId = modelId;
    this.options = options;
    debug('init:', this.modelId);
  }

  private session!: ChromeAISession;
  private getSession = async (
    options?: ChromeAISessionOptions
  ): Promise<ChromeAISession> => {
    if (!globalThis.ai?.canCreateGenericSession) {
      throw new LoadSettingError({ message: 'Browser not support' });
    }

    const available =
      this.modelId === 'text'
        ? await ai.canCreateTextSession()
        : await ai.canCreateGenericSession();

    if (this.session) return this.session;

    if (available !== 'readily') {
      throw new LoadSettingError({ message: 'Built-in model not ready' });
    }

    const defaultOptions =
      this.modelId === 'text'
        ? await ai.defaultTextSessionOptions()
        : await ai.defaultGenericSessionOptions();
    this.options = { ...defaultOptions, ...this.options, ...options };

    this.session =
      this.modelId === 'text'
        ? await ai.createTextSession(this.options)
        : await ai.createGenericSession(this.options);

    debug('session created:', this.session, this.options);
    return this.session;
  };

  private formatMessages = (options: LanguageModelV1CallOptions): string => {
    let prompt: LanguageModelV1Prompt = options.prompt;
    debug('before format prompt:', prompt);

    let result = '';

    if (
      // When the user supplied a prompt input, we don't transform it
      options.inputFormat === 'prompt' &&
      prompt.length === 1 &&
      prompt[0].role === 'user' &&
      prompt[0].content.length === 1 &&
      prompt[0].content[0].type === 'text'
    ) {
      result += prompt[0].content[0].text;
    } else {
      // Use magic prompt for object-json mode
      if (options.mode.type === 'object-json') {
        prompt.unshift({
          role: 'system',
          content: `Throughout our conversation, always start your responses with "{" and end with "}", ensuring the output is a concise JSON object and strictly avoid including any comments, notes, explanations, or examples in your output.\nFor instance, if the JSON schema is {"type":"object","properties":{"someKey":{"type":"string"}},"required":["someKey"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}, your response should immediately begin with "{" and strictly end with "}", following the format: {"someKey": "someValue"}.\nAdhere to this format for all queries moving forward.`,
        });
      }

      for (let index = 0; index < prompt.length; index += 1) {
        const { role, content } = prompt[index];
        const contentString = getStringContent(content);

        switch (role) {
          case 'system':
            result += `${contentString}\n`;
            break;
          case 'assistant':
          case 'tool':
            result += `model\n${contentString}\n`;
            break;
          case 'user':
          default:
            result += `user\n${contentString}\n`;
            break;
        }
      }
      result += `model\n`;
    }

    debug('formated message:', result);
    return result;
  };

  public doGenerate = async (
    options: LanguageModelV1CallOptions
  ): Promise<{
    text?: string;
    toolCalls?: LanguageModelV1FunctionToolCall[];
    finishReason: LanguageModelV1FinishReason;
    usage: { promptTokens: number; completionTokens: number };
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    warnings?: LanguageModelV1CallWarning[];
    logprobs?: LanguageModelV1LogProbs;
  }> => {
    debug('generate options:', options);

    if (['regular', 'object-json'].indexOf(options.mode.type) < 0) {
      throw new UnsupportedFunctionalityError({
        functionality: `${options.mode.type} mode`,
      });
    }

    const session = await this.getSession();
    const message = this.formatMessages(options);
    const text = await session.prompt(message);
    debug('generate result:', text);
    return {
      text,
      finishReason: 'stop',
      usage: { promptTokens: 0, completionTokens: 0 },
      rawCall: { rawPrompt: options.prompt, rawSettings: this.options },
    };
  };

  public doStream = async (
    options: LanguageModelV1CallOptions
  ): Promise<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    warnings?: LanguageModelV1CallWarning[];
  }> => {
    debug('stream options:', options);

    if (['regular', 'object-json'].indexOf(options.mode.type) < 0) {
      throw new UnsupportedFunctionalityError({
        functionality: `${options.mode.type} mode`,
      });
    }

    const session = await this.getSession();
    const message = this.formatMessages(options);
    const promptStream = session.promptStreaming(message);
    const transformStream = new StreamAI();
    const stream = promptStream.pipeThrough(transformStream);

    return {
      stream,
      rawCall: { rawPrompt: options.prompt, rawSettings: this.options },
    };
  };
}

export const chromeai = (
  modelId: ChromeAIChatModelId = 'generic',
  settings: ChromeAIChatSettings = {}
) => new ChromeAIChatLanguageModel(modelId, settings);

chromeai.embedding = chromeEmbedding;
