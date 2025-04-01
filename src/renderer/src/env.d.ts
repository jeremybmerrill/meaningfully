/// <reference types="svelte" />
/// <reference types="vite/client" />


interface Settings {
  openAIKey: string;
  oLlamaModelType: string;
  oLlamaBaseURL: string;
}
interface SearchResult {
  content: string;
  similarity: number;
  [key: string]: any; // For metadata fields
  sourceNodeId: string | undefined;
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
        splitIntoSentences: boolean,
        combineSentencesIntoChunks: boolean,
        sploderMaxSize: number,
        chunkSize: number,
        chunkOverlap: number,
        modelName: string,
        modelProvider: string
      }) => Promise<{ success: true, documentSetId: number }>,
      generatePreviewData: (formData: {
        file: File,
        datasetName: string, // not really needed
        description: string, // not really needed
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
      searchDocumentSet: (params: {
        documentSetId: number;
        query: string;
        n_results: number;
        filters?: { 
          key: string, 
          operator: "==" | "in" | ">" | "<" | "!=" | ">=" | "<=" | "nin" | "any" | "all" | "text_match" | "contains" | "is_empty", 
          value: any 
        }[];
      }) => Promise<SearchResult[]>;
      getDocument: (params: {documentSetId: number, documentId: string}) => Promise<{ text: string, metadata: Record<string, any> }>;
      getSettings: () => Promise<Settings>;
      setSettings: (settings: Settings) => Promise<{success: boolean}>;
      deleteDocumentSet: (documentSetId: number) => Promise<void>;
      getDocumentSet: (documentSetId: number) => Promise<DocumentSet>;
    }
  }
  