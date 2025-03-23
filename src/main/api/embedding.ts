import { embedDocuments, createPreviewNodes, estimateCost, searchDocuments, getExistingVectorStoreIndex, persistNodes, persistDocuments, getExistingDocStore } from "../services/embeddings";
import type { EmbeddingConfig, EmbeddingResult, SearchResult, PreviewResult, Settings, MetadataFilter} from "../types";
import { loadDocumentsFromCsv } from "../services/csvLoader";
import { MetadataMode } from "llamaindex";

export async function createEmbeddings(
  csvPath: string,
  textColumnName: string,
  config: EmbeddingConfig,
  settings: Settings
): Promise<EmbeddingResult> {
  try {
    const documents = await loadDocumentsFromCsv(csvPath, textColumnName);
    if (documents.length === 0) {
      return {
        success: false,
        error: "That CSV does not appear to contain any documents. Please check the file and try again.",
      };
    }
    const nodes = await embedDocuments(documents, config, settings);
    const index = await persistNodes(nodes, config, settings);
    await persistDocuments(documents, config, settings);
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
  config: EmbeddingConfig
): Promise<PreviewResult> {
  try {
    const documents = await loadDocumentsFromCsv(csvPath, textColumnName);
    if (documents.length === 0) {
      return {
        success: false,
        error: "That CSV does not appear to contain any documents. Please check the file and try again.",
      };
    }
    // Take 10 rows from the middle of the dataset for preview
    // we take a consistent 10 so that the results of the preview are consistent (i.e. with a larger chunk size, you have fewer, longer results, but more shorter ones if you adjust it)
    // and we take from the middle because the initial rows may be idiosyncratic.
    const previewDocumentsSubset = documents.slice(
      Math.floor(documents.length / 2),
      Math.floor(documents.length / 2) + 10
    );

    const previewNodes = await createPreviewNodes(documents, config);
    const previewSubsetNodes = await createPreviewNodes(previewDocumentsSubset, config);
    const { estimatedPrice, tokenCount } = estimateCost(previewNodes, config.modelName);

    return {
      success: true,
      nodes: previewSubsetNodes.map(node => ({
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

export async function getDocStore(config: EmbeddingConfig) {
  return await getExistingDocStore(config);
}

export async function getIndex(config: EmbeddingConfig, settings: Settings) {
  return await getExistingVectorStoreIndex(config, settings);
}

export async function search(
  index: any,
  query: string,
  numResults: number = 10,
  filters?: MetadataFilter[]
): Promise<SearchResult[]> {
  const results = await searchDocuments(index, query, numResults, filters);
  return results.map((result) => ({
    text: result.node.getContent(MetadataMode.NONE),
    score: result.score ?? 0,
    metadata: result.node.metadata,
    //  @ts-ignore
    sourceNodeId: result.node.relationships?.SOURCE?.nodeId
  }));
}
