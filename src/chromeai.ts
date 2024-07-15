import {
  ChromeAIEmbeddingModel,
  ChromeAIEmbeddingModelSettings,
} from './embedding-model';
import {
  ChromeAIChatLanguageModel,
  ChromeAIChatModelId,
  ChromeAIChatSettings,
} from './language-model';
import createDebug from 'debug';

const debug = createDebug('chromeai');

/**
 * Create a new ChromeAI model/embedding instance.
 * @param modelId 'text' | 'embedding'
 * @param settings Options for the model
 */
export function chromeai(
  modelId?: ChromeAIChatModelId,
  settings?: ChromeAIChatSettings
): ChromeAIChatLanguageModel;
export function chromeai(
  modelId?: 'embedding',
  settings?: ChromeAIEmbeddingModelSettings
): ChromeAIEmbeddingModel;
export function chromeai(modelId: string = 'text', settings: any = {}) {
  debug('create instance', modelId, settings);
  if (modelId === 'embedding') {
    return new ChromeAIEmbeddingModel(settings);
  }
  return new ChromeAIChatLanguageModel(
    modelId as ChromeAIChatModelId,
    settings
  );
}

/** @deprecated use `chromeai('embedding'[, options])` */
chromeai.embedding = (settings: ChromeAIEmbeddingModelSettings = {}) =>
  new ChromeAIEmbeddingModel(settings);
