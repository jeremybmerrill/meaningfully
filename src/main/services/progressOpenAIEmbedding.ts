// temporary
// this is a wrapper around OpenAIEmbedding that logs the input of the embedding
// it's used to debug the embedding process (to make sure random metadata isn't wrongfully included)
// it's not used in the production code

import { OpenAIEmbedding, BaseEmbeddingOptions } from "llamaindex";
import type {
  AzureClientOptions,
  OpenAI as OpenAILLM,
} from "openai";
type LLMInstance = Pick<OpenAILLM, "embeddings" | "apiKey">;

type EmbedFunc<T> = (values: T[]) => Promise<Array<number[]>>;

export class ProgressOpenAIEmbedding extends OpenAIEmbedding {
  progressCallback: ((progress: number, total: number) => void) | undefined;
  
  async getTextEmbeddingsBatch(
    texts: string[],
    options?: BaseEmbeddingOptions,
  ): Promise<Array<number[]>> {
    return await this.batchEmbeddings(
      texts,
      this.getTextEmbeddings,
      this.embedBatchSize,
      options,
    );
  }
  
  async batchEmbeddings<T>(
      values: T[],
      embedFunc: EmbedFunc<T>,
      chunkSize: number,
      /* ts-ignore */
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      options?: BaseEmbeddingOptions,
    ): Promise<Array<number[]>> {
      const resultEmbeddings: Array<number[]> = [];
      const queue: T[] = values;
      const curBatch: T[] = [];
      for (let i = 0; i < queue.length; i++) {
        curBatch.push(queue[i]!);
        if (i == queue.length - 1 || curBatch.length == chunkSize) {
          const embeddings = await embedFunc(curBatch);
    
          resultEmbeddings.push(...embeddings);
          if (this.progressCallback) {
            this.progressCallback?.(i+1, queue.length);
          } else if (options?.logProgress) {
            console.log(
              `Progress: ${i + 1} / ${queue.length} (${Math.floor(
                ((i + 1) / queue.length) * 100
              )}%)`,
            );
          }
    
          curBatch.length = 0;
        }
      }
    
      return resultEmbeddings;
    }

  constructor(
    init?: Omit<Partial<OpenAIEmbedding>, "lazySession"> & {
      session?: LLMInstance | undefined;
      azure?: AzureClientOptions;
    },
    progressCallback?: (progress: number, total: number) => void,
  ) {
    super(init);
    this.progressCallback = progressCallback;
  }
}