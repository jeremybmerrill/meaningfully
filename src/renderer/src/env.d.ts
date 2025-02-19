/// <reference types="svelte" />
/// <reference types="vite/client" />



interface SearchResult {
  content: string;
  similarity: number;
  [key: string]: any; // For metadata fields
} 

interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void
      }
      process: {
        versions: Record<string, string>
      }
    }
    api: {
      listDocumentSets: () => Promise<DocumentSet[]>,
      uploadCsv: (formData: {
        file: File,
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
      }) => Promise<{ success: true, setId: number }>,
      generatePreviewData: (formData: {
        file: File,
        datasetName: string, // not really needed
        description: string, // not really needed
        textColumns: string[],
        metadataColumns: string[],
        useSploder: boolean,
        sploderMaxSize: number,
        chunkSize: number,
        chunkOverlap: number,
        modelName: string,
        modelProvider: string
      }) => Promise<{ success: true, nodes: Record<string, any>[], estimatedPrice: number, tokenCount: number }>,
      searchDocumentSet: (params: {
        documentSetId: number;
        query: string;
        n_results: number;
        filters?: Record<string, string>;
      }) => Promise<SearchResult[]>;
  
    }
  }
  