import { embedDocuments, createPreviewNodes, estimateCost, searchDocuments, getExistingVectorStoreIndex, persistNodes } from "../services/embeddings";
import type { EmbeddingResult, SearchResult, PreviewResult } from "../types";
import { loadDocumentsFromCsv } from "../services/csvLoader";
import { MetadataMode } from "llamaindex";
import type { EmbeddingConfig } from "../services/embeddings";

export async function createEmbeddings(
  csvPath: string,
  textColumnName: string,
  config: {
    modelName: string;
    useSploder: boolean;
    sploderMaxSize: number;
    vectorStoreType: "simple"; // TODO: | "chroma" | "duckdb" | "postgres" | "weaviate";
    projectName: string;
    storagePath: string;
    chunkSize: number;
    chunkOverlap: number;
  }
): Promise<EmbeddingResult> {
  try {
    const documents = await loadDocumentsFromCsv(csvPath, textColumnName);
    const nodes = await embedDocuments(documents, config);
    const index = await persistNodes(nodes, config);
    return {
      success: true,
      index,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// TODO: rename this to be parallel to createEmbeddings
export async function previewResults(
  csvPath: string,
  textColumnName: string,
  config: {
    modelName: string;
    useSploder: boolean;
    sploderMaxSize: number;
    vectorStoreType: "simple"  | "postgres"; // TODO: "chroma" | "duckdb";
    projectName: string;
    storagePath: string;
    chunkSize: number;
    chunkOverlap: number;
  }
): Promise<PreviewResult> {
  try {
    console.log("previewResults", config);
    const documents = await loadDocumentsFromCsv(csvPath, textColumnName);

    // Take 10 rows from the middle of the dataset for preview
    // we take a consistent 10 so that the results of the preview are consistent (i.e. with a larger chunk size, you have fewer, longer results, but more shorter ones if you adjust it)
    // and we take from the middle because the initial rows may be idiosyncratic.
    const previewDocumentsSubset = documents.slice(
      Math.floor(documents.length / 2),
      Math.floor(documents.length / 2) + 10
    );

    const previewNodes = await createPreviewNodes(previewDocumentsSubset, config);
    const { estimatedPrice, tokenCount } = estimateCost(previewNodes, config.modelName);

    return {
      success: true,
      nodes: previewNodes.map(node => ({
        text: node.text,
        metadata: node.metadata
      })),
      estimatedPrice,
      tokenCount
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
} 

export async function getIndex(config: EmbeddingConfig) {
  return await getExistingVectorStoreIndex(config);
}

export async function search(
  index: any,
  query: string,
  numResults: number = 10
): Promise<SearchResult[]> {
  const results = await searchDocuments(index, query, numResults); //  (await searchDocuments(index, query, numResults)) as TextNode[];
  return results.map((result) => ({
    text: result.node.getContent(MetadataMode.NONE),
    score: result.score ?? 0, 
    metadata: result.node.metadata,
  }));
}
