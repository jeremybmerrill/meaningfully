import { embedDocuments, createPreviewNodes, estimateCost, searchDocuments } from "../../meaningfully/src/main/services/embeddings";
import { EmbeddingResult, SearchResult, PreviewResult } from "../../meaningfully/src/main/types";
import { TextNode } from "llamaindex";
import { loadDocumentsFromCsv } from '../../meaningfully/src/main/services/csvLoader';


export async function createEmbeddings(
  csvPath: string,
  textColumnName: string,
  config: {
    modelName: string;
    useSploder: boolean;
    sploderMaxSize: number;
    vectorStoreType: "simple"; // "chroma" | "duckdb" | "postgres";
    projectName: string;
  }
): Promise<EmbeddingResult> {
  try {
    const index = await embedDocuments(csvPath, textColumnName, config);
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

export async function search(
  index: any,
  query: string,
  numResults: number = 10
): Promise<SearchResult[]> {
  const results = (await searchDocuments(index, query, numResults)) as TextNode[];
  return results.map((result) => ({
    text: result.node.text,
    score: result.score,
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
    vectorStoreType: "simple" | "postgres"; // "chroma" | "duckdb" ;
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