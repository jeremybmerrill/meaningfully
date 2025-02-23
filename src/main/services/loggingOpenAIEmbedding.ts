
// temporary
// this is a wrapper around OpenAIEmbedding that logs the input of the embedding
// it's used to debug the embedding process (to make sure random metadata isn't wrongfully included)
// it's not used in the production code

import { OpenAIEmbedding } from "llamaindex";
import type {
  AzureClientOptions,
  OpenAI as OpenAILLM,
} from "openai";
type LLMInstance = Pick<OpenAILLM, "embeddings" | "apiKey">;


export class LoggingOpenAIEmbedding extends OpenAIEmbedding {
  constructor(
    init?: Omit<Partial<OpenAIEmbedding>, "lazySession"> & {
      session?: LLMInstance | undefined;
      azure?: AzureClientOptions;
    },
  ) {
    super(init);
    // overwrite private member "getMessage" 🙀
    (this as any).getOpenAIEmbedding = async function(input: string[]): Promise<number[][]> {
      // TODO: ensure this for every sub class by calling it in the base class
      input = this.truncateMaxTokens(input);
    
      const { data } = await (
        await this.session
      ).embeddings.create(
        this.dimensions
          ? {
              model: this.model,
              dimensions: this.dimensions, // only sent to OpenAI if set by user
              input,
            }
          : {
              model: this.model,
              input,
            },
      );
    
      return data.map((d) => d.embedding);
    }
  }
}
