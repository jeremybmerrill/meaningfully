export interface SearchResult {
  text: string;
  score: number;
  metadata: Record<string, any>;
}

export interface EmbeddingResult {
  success: boolean;
  error?: string;
  index?: any;
}

export interface PreviewResult {
  success: boolean;
  error?: string;
  nodes?: Array<{
    text: string;
    metadata: Record<string, any>;
  }>;
  estimatedPrice?: number;
  tokenCount?: number;
} 


// Define types for our document set metadata
export interface DocumentSetMetadata {
  setId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}

export interface DocumentSetParams {
  datasetName: string,
  description: string,
  textColumns: string[],
  metadataColumns: string[],
  useSploder: boolean,
  sploderMaxSize: number,
  chunkSize: number,
  chunkOverlap: number,
  modelName: string,
  modelProvider: string
}


export interface EmbeddingConfig {
  modelName: string;
  vectorStoreType: "simple" | "postgres" ;
  projectName: string;
  storagePath: string;
  useSploder: boolean;
  sploderMaxSize: number;
  chunkSize: number;
  chunkOverlap: number;
}
