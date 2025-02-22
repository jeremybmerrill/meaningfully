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


// Define types for our document set metadata
export interface DocumentSetMetadata {
  documentSetId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listDocumentSets: () => Promise<DocumentSetMetadata[]>,
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
      }) => Promise<SearchResult[]>
    }
  }
}
