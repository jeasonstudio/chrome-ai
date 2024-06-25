import {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1ImagePart,
  LanguageModelV1LogProbs,
  LanguageModelV1Message,
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
    return content;
  } else if (Array.isArray(content) && content.length > 0) {
    const [first] = content;
    if (first.type !== 'text') {
      throw new UnsupportedFunctionalityError({ functionality: 'toolCall' });
    }
    return first.text;
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

  private magicPrompts: Record<
    LanguageModelV1CallOptions['mode']['type'],
    string | null
  > = {
    regular: null,
    'object-grammar': null,
    'object-tool': null,
    'object-json':
      'Always response pure json string format that matches the JSON schema above, not markdown or other format!!',
  };
  private roleMap: Record<LanguageModelV1Message['role'], string> = {
    system: 'system',
    user: 'user',
    tool: 'user',
    assistant: 'model',
  };

  private formatMessages = (options: LanguageModelV1CallOptions): string => {
    let prompt: LanguageModelV1Prompt = options.prompt;

    // When the user supplied a prompt input, we don't transform it:
    if (
      options.inputFormat === 'prompt' &&
      prompt.length === 1 &&
      prompt[0].role === 'user' &&
      prompt[0].content.length === 1 &&
      prompt[0].content[0].type === 'text'
    ) {
      debug('formated message:', prompt[0].content[0].text);
      return prompt[0].content[0].text;
    }

    // FIXME: something tricky here
    if (this.magicPrompts[options.mode.type]) {
      prompt = [
        { role: 'system', content: this.magicPrompts[options.mode.type]! },
        ...prompt,
      ];
    }

    const messages = prompt
      .map(
        ({ role, content }) =>
          `${this.roleMap[role]}:\n${getStringContent(content)}`
      )
      .join('\n\n');
    debug('format prompt:', prompt);
    debug('formated message:', messages);
    return messages + `\n`;
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
    const session = await this.getSession({ temperature: options.temperature });
    const message = this.formatMessages(options);
    const text = await session.prompt(message);
    debug('generate options:', options);
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
    const session = await this.getSession({ temperature: options.temperature });
    const message = this.formatMessages(options);
    const promptStream = session.promptStreaming(message);
    debug('stream options:', options);
    const transformStream = new TransformStream<
      string,
      LanguageModelV1StreamPart
    >({
      transform(textDelta, controller) {
        controller.enqueue({ type: 'text-delta', textDelta });
      },
      flush(controller) {
        controller.enqueue({
          type: 'finish',
          finishReason: 'stop',
          usage: { completionTokens: 0, promptTokens: 0 },
        });
        controller.terminate();
      },
    });
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
