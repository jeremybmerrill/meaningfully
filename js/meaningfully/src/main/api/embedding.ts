import { embedDocuments, createPreviewNodes, estimateCost, searchDocuments, getExistingVectorStoreIndex } from "../services/embeddings";
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
  }
): Promise<EmbeddingResult> {
  try {
    const documents = await loadDocumentsFromCsv(csvPath, textColumnName);
    const index = await embedDocuments(documents, config);
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

export async function previewEmbeddings(
  csvPath: string,
  textColumnName: string,
  config: {
    modelName: string;
    useSploder: boolean;
    sploderMaxSize: number;
    vectorStoreType: "simple"; // TODO: "chroma" | "duckdb" | "postgres";
    projectName: string;
    storagePath: string;
  }
): Promise<PreviewResult> {
  try {
    const documents = await loadDocumentsFromCsv(csvPath, textColumnName);
    const previewNodes = await createPreviewNodes(documents, config);
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