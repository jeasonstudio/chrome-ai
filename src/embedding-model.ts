import { EmbeddingModelV1, EmbeddingModelV1Embedding } from '@ai-sdk/provider';
import { TextEmbedder } from '@mediapipe/tasks-text';

export interface ChromeAIEmbeddingModelSettings {
  /**
   * An optional base path to specify the directory the Wasm files should be loaded from.
   * @default 'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/text_wasm_internal.js'
   */
  wasmLoaderPath?: string;
  /**
   * It's about 6mb before gzip.
   * @default 'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/text_wasm_internal.wasm'
   */
  wasmBinaryPath?: string;
  /**
   * The model path to the model asset file.
   * It's about 6.1mb before gzip.
   * @default 'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/universal_sentence_encoder.tflite'
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

// See more:
// - https://github.com/google-ai-edge/mediapipe
// - https://ai.google.dev/edge/mediapipe/solutions/text/text_embedder/web_js
export class ChromeAIEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly provider = 'google-mediapipe';
  readonly modelId: string = 'embedding';
  readonly supportsParallelCalls = true;
  readonly maxEmbeddingsPerCall = undefined;

  private settings: ChromeAIEmbeddingModelSettings = {
    wasmLoaderPath:
      'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/text_wasm_internal.js',
    wasmBinaryPath:
      'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/text_wasm_internal.wasm',
    modelAssetPath:
      'https://pub-ddcfe353995744e89b8002f16bf98575.r2.dev/universal_sentence_encoder.tflite',
    l2Normalize: false,
    quantize: false,
  };
  private modelAssetBuffer!: Promise<ReadableStreamDefaultReader>;
  private textEmbedder!: Promise<TextEmbedder>;

  public constructor(settings: ChromeAIEmbeddingModelSettings = {}) {
    this.settings = { ...this.settings, ...settings };
    this.modelAssetBuffer = fetch(this.settings.modelAssetPath!).then(
      (response) => response.body!.getReader()
    )!;
    this.textEmbedder = this.getTextEmbedder();
  }

  protected getTextEmbedder = async (): Promise<TextEmbedder> => {
    return TextEmbedder.createFromOptions(
      {
        wasmBinaryPath: this.settings.wasmBinaryPath!,
        wasmLoaderPath: this.settings.wasmLoaderPath!,
      },
      {
        baseOptions: {
          modelAssetBuffer: await this.modelAssetBuffer,
          delegate: this.settings.delegate,
        },
        l2Normalize: this.settings.l2Normalize,
        quantize: this.settings.quantize,
      }
    );
  };

  public doEmbed = async (options: {
    values: string[];
    abortSignal?: AbortSignal;
  }): Promise<{
    embeddings: Array<EmbeddingModelV1Embedding>;
    rawResponse?: Record<PropertyKey, any>;
  }> => {
    // if (options.abortSignal) console.warn('abortSignal is not supported');
    const embedder = await this.textEmbedder;
    const embeddings = options.values.map((text) => {
      const embedderResult = embedder.embed(text);
      const [embedding] = embedderResult.embeddings;
      return embedding?.floatEmbedding ?? [];
    });
    return { embeddings };
  };
}
