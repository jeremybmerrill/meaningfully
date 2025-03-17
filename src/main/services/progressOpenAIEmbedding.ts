
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
  progress_callback: ((progress: number, total: number) => void) | undefined;
  constructor(
    init?: Omit<Partial<OpenAIEmbedding>, "lazySession"> & {
      session?: LLMInstance | undefined;
      azure?: AzureClientOptions;
    },
    progress_callback?: (progress: number, total: number) => void,
  ) {
    super(init);
    this.progress_callback = progress_callback;
    // overwrite private member "getMessage" 🙀
    (this as any).batchEmbeddings = async function<T>(
        values: T[],
        embedFunc: EmbedFunc<T>,
        chunkSize: number,
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
      
            if (options?.logProgress) {
              this.progress_callback?.(i, queue.length);
              console.log(`getting embedding progress: ${i} / ${queue.length}`);
            }
      
            curBatch.length = 0;
          }
        }
      
        return resultEmbeddings;
      }
  }
}