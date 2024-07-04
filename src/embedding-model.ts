import { EmbeddingModelV1, EmbeddingModelV1Embedding } from '@ai-sdk/provider';
import { TextEmbedder, FilesetResolver } from '@mediapipe/tasks-text';

export interface ChromeAIEmbeddingModelSettings {
  /**
   * An optional base path to specify the directory the Wasm files should be loaded from.
   * It's about 6mb before gzip.
   * @default 'https://unpkg.com/@mediapipe/tasks-text/wasm/'
   */
  filesetBasePath?: string;
  /**
   * The model path to the model asset file.
   * It's about 6.1mb before gzip.
   * @default 'https://storage.googleapis.com/mediapipe-models/text_embedder/universal_sentence_encoder/float32/1/universal_sentence_encoder.tflite'
   */
  modelAssetPath?: string;
  /**
   * Whether to normalize the returned feature vector with L2 norm. Use this
   * option only if the model does not already contain a native L2_NORMALIZATION
   * TF Lite Op. In most cases, this is already the case and L2 norm is thus
   * achieved through TF Lite inference.
   * @default false
   */
  l2Normalize?: boolean;
  /**
   * Whether the returned embedding should be quantized to bytes via scalar
   * quantization. Embeddings are implicitly assumed to be unit-norm and
   * therefore any dimension is guaranteed to have a value in [-1.0, 1.0]. Use
   * the l2_normalize option if this is not the case.
   * @default false
   */
  quantize?: boolean;
  /**
   * Overrides the default backend to use for the provided model.
   */
  delegate?: 'CPU' | 'GPU';
}

export class ChromeAIEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly provider = 'google-mediapipe';
  readonly modelId: string = 'mediapipe';
  readonly supportsParallelCalls = true;
  readonly maxEmbeddingsPerCall = undefined;

  private settings: ChromeAIEmbeddingModelSettings = {
    filesetBasePath: 'https://unpkg.com/@mediapipe/tasks-text/wasm/',
    modelAssetPath:
      'https://storage.googleapis.com/mediapipe-models/text_embedder/universal_sentence_encoder/float32/1/universal_sentence_encoder.tflite',
    l2Normalize: false,
    quantize: false,
  };
  private textEmbedder: TextEmbedder | null = null;

  public constructor(settings: ChromeAIEmbeddingModelSettings = {}) {
    this.settings = { ...this.settings, ...settings };
  }

  protected getTextEmbedder = async (): Promise<TextEmbedder> => {
    if (this.textEmbedder !== null) return this.textEmbedder;
    const textFiles = await FilesetResolver.forTextTasks(
      this.settings.filesetBasePath
    );
    this.textEmbedder = await TextEmbedder.createFromOptions(textFiles, {
      baseOptions: {
        modelAssetPath: this.settings.modelAssetPath,
        delegate: this.settings.delegate,
      },
      l2Normalize: this.settings.l2Normalize,
      quantize: this.settings.quantize,
    });
    return this.textEmbedder;
  };

  public doEmbed = async (options: {
    values: string[];
    abortSignal?: AbortSignal;
  }): Promise<{
    embeddings: Array<EmbeddingModelV1Embedding>;
    rawResponse?: Record<PropertyKey, any>;
  }> => {
    // if (options.abortSignal) console.warn('abortSignal is not supported');

    const embedder = await this.getTextEmbedder();
    const embeddings = await Promise.all(
      options.values.map((text) => {
        const embedderResult = embedder.embed(text);
        const [embedding] = embedderResult.embeddings;
        return embedding?.floatEmbedding ?? [];
      })
    );
    return { embeddings };
  };
}

export const chromeEmbedding = (options?: ChromeAIEmbeddingModelSettings) =>
  new ChromeAIEmbeddingModel(options);
