// remove this file in favor of LlamaIndex's GeminiEmbedding
// once https://github.com/run-llama/LlamaIndexTS/pull/2099 is merged

import { GoogleGenAI } from '@google/genai';
import { getEnv } from '@llamaindex/env';
import { BaseEmbedding } from '@llamaindex/core/embeddings';
import { BaseEmbeddingOptions } from "llamaindex";
type EmbedFunc<T> = (values: T[]) => Promise<Array<number[]>>;

var GEMINI_EMBEDDING_MODEL = /*#__PURE__*/ function(GEMINI_EMBEDDING_MODEL) {
    GEMINI_EMBEDDING_MODEL["EMBEDDING_001"] = "embedding-001";
    GEMINI_EMBEDDING_MODEL["TEXT_EMBEDDING_004"] = "text-embedding-004";
    return GEMINI_EMBEDDING_MODEL;
}({});
/**
 * GeminiEmbedding is an alias for Gemini that implements the BaseEmbedding interface.
 */ class GeminiEmbedding extends BaseEmbedding {
    ai: GoogleGenAI;
    model: string;
    progressCallback: ((progress: number, total: number) => void) | undefined;

    constructor(opts){
        super();
        const apiKey = opts?.apiKey ?? getEnv("GOOGLE_API_KEY");
        if (!apiKey) {
            throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
        }
        this.ai = new GoogleGenAI({
            ...opts,
            apiKey
        });
        this.model = opts?.model ?? "embedding-001";
    }
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

    getTextEmbeddings = async (texts: string[]) => {
        const result = await this.ai.models.embedContent({
            model: this.model,
            contents: texts
        });
        return result.embeddings?.map((embedding)=>embedding.values ?? []) ?? [];
    }
    async getTextEmbedding(text) {
        const result = await this.ai.models.embedContent({
            model: this.model,
            contents: text
        });
        return result.embeddings?.[0]?.values ?? [];
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
}

export { GeminiEmbedding, GEMINI_EMBEDDING_MODEL };
