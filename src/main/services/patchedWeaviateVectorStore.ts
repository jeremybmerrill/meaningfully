import { WeaviateVectorStore } from '@llamaindex/weaviate';
import { BaseNode } from 'llamaindex';

export class PatchedWeaviateVectorStore extends WeaviateVectorStore {
  async add(nodes: BaseNode[]): Promise<string[]> {
    const batchSize = 100; // Define the batch size
    const results: string[] = []; // Collect results from each batch
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      const batchResults = await super.add(batch); // Call the parent class's add method for each batch
      results.push(...batchResults); // Aggregate results
    }
    return results; // Return aggregated results
  }
}
