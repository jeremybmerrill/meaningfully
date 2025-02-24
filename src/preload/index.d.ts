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
  oLlamaModelType: string;
  oLlamaBaseURL: string;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listDocumentSets: () => Promise<DocumentSetMetadata[]>,
      getDocumentSet: (documentSetId: number) => Promise<DocumentSetMetadata>,
      deleteDocumentSet: (documentSetId: number) => Promise<void>,
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
        filters?: Record<string, string>;
      }) => Promise<SearchResult[]>,
      getSettings: () => Promise<Settings>, 
      setSettings: (settings: Settings) => Promise<void>,
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
    }
  }
}
