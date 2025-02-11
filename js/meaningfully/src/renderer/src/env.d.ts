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
        metadataColumns: string[]
      }) => Promise<{ success: true, setId: number }>,
      searchDocumentSet: (params: {
        documentSetId: number;
        query: string;
        filters?: Record<string, string>;
      }) => Promise<SearchResult[]>;
  
    }
  }
  