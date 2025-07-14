import { ElectronAPI } from '@electron-toolkit/preload'


// copy pasta from ../main/types/index.tx
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

export interface DocumentSetMetadata {
  documentSetId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}

export interface Settings {
  openAIKey: string;
  oLlamaBaseURL: string;
  azureOpenAIKey: string;
  azureOpenAIEndpoint: string;
  azureOpenAIApiVersion: string;
  mistralApiKey: string;
  geminiApiKey: string;
}

export interface UploadProgress {
  progress: number;
  total: number;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listDocumentSets: () => Promise<{documents: DocumentSetMetadata[], total: number}> ,
      getDocumentSet: (documentSetId: number) => Promise<DocumentSetMetadata>,
      uploadCsv: (formData: {
        file: File,
        datasetName: string,
        description: string,
        textColumns: string[],
        metadataColumns: string[]
      }) => Promise<{ success: true, documentSetId: number }>,
      searchDocumentSet: (params: {
        documentSetId: number;
        query: string;
        n_results: number;
        filters?: { 
          key: string, 
          operator: "==" | "in" | ">" | "<" | "!=" | ">=" | "<=" | "nin" | "any" | "all" | "text_match" | "contains" | "is_empty", 
          value: any 
        }[];
      }) => Promise<SearchResult[]>,
      getDocument(params: {
        documentSetId: number;
        documentId: string;
      }): Promise<{ text: string, metadata: Record<string, any> }>,
      getSettings: () => Promise<Settings>, 
      setSettings: (settings: Settings) => Promise<void>,
      deleteDocumentSet: (documentSetId: number) => Promise<{ success: boolean }>,
      generatePreviewData: (formData: {
        file: File,
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
      }) => Promise<{ success: boolean, nodes: Record<string, any>[], estimatedPrice: number, tokenCount: number }>,
      getUploadProgress: () => Promise<UploadProgress>
    }
  }
}
