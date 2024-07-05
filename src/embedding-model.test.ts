import { describe, it, expect, vi } from 'vitest';
import { ChromeAIEmbeddingModel } from './embedding-model';
import { embed } from 'ai';

vi.mock('@mediapipe/tasks-text', async () => ({
  FilesetResolver: {
    forTextTasks: vi.fn(async () => ({
      wasmLoaderPath: 'wasmLoaderPath',
      wasmBinaryPath: 'wasmBinaryPath',
    })),
  },
  TextEmbedder: {
    createFromOptions: vi.fn(async () => ({
      embed: vi.fn((text: string) => ({
        embeddings: [
          { floatEmbedding: text === 'undefined' ? undefined : [1, 2] },
        ],
      })),
    })),
  },
}));

describe('embedding-model', () => {
  it('should instantiation anyways', async () => {
    expect(new ChromeAIEmbeddingModel()).toBeInstanceOf(ChromeAIEmbeddingModel);
    expect(new ChromeAIEmbeddingModel()).toBeInstanceOf(ChromeAIEmbeddingModel);
  });
  it('should embed', async () => {
    const model = new ChromeAIEmbeddingModel();
    expect(
      await embed({
        model,
        value: 'test',
      })
    ).toMatchObject({ embedding: [1, 2] });

    expect(
      await embed({
        model,
        value: 'test2',
      })
    ).toMatchObject({ embedding: [1, 2] });
  });

  it('should embed result empty', async () => {
    expect(
      await embed({
        model: new ChromeAIEmbeddingModel({ l2Normalize: true }),
        value: 'undefined',
      })
    ).toMatchObject({ embedding: [] });
  });
});
