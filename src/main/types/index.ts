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
  pricePer1M?: number;
} 


// Define types for our document set metadata
export interface DocumentSetMetadata {
  documentSetId: number;
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
  splitIntoSentences: boolean,
  combineSentencesIntoChunks: boolean,
  sploderMaxSize: number,
  chunkSize: number,
  chunkOverlap: number,
  modelName: string,
  modelProvider: string
}


export interface EmbeddingConfig {
  modelName: string;
  modelProvider: string
  vectorStoreType: "simple" | "postgres" | "weaviate";
  projectName: string;
  storagePath: string;
  splitIntoSentences: boolean;
  combineSentencesIntoChunks: boolean;
  sploderMaxSize: number;
  chunkSize: number;
  chunkOverlap: number;
}


export interface Settings {
  openAIKey: string | null;
  oLlamaBaseURL: string | null;
  azureOpenAIKey: string | null;
  azureOpenAIEndpoint: string | null;
  azureOpenAIApiVersion: string | null;
  mistralApiKey: string | null;
  geminiApiKey: string | null;
}

export interface MetadataFilter{ 
  key: string, 
  operator: "==" | "in" | ">" | "<" | "!=" | ">=" | "<=" | "nin" | "any" | "all" | "text_match" | "contains" | "is_empty", 
  value: any 
}

export interface Clients {
  weaviateClient: any;
  postgresClient: any;
}