/// <reference types="svelte" />
/// <reference types="vite/client" />


interface Settings {
  openAIKey: string;
  oLlamaBaseURL: string;
  azureOpenAIKey: string;
  azureOpenAIEndpoint: string;
  azureOpenAIApiVersion: string;
  mistralApiKey: string;
  geminiApiKey: string;
}

interface SearchResult {
  content: string;
  similarity: number;
  [key: string]: any; // For metadata fields
  sourceNodeId: string | undefined;
}

interface BaseUploadFormData {
  datasetName: string;
  description: string;
  textColumns: string[];
  metadataColumns: string[];
  splitIntoSentences: boolean;
  combineSentencesIntoChunks: boolean;
  sploderMaxSize: number;
  chunkSize: number;
  chunkOverlap: number;
  modelName: string;
  modelProvider: string;
}

interface FileUploadFormData extends BaseUploadFormData {
  file: File;
}

interface ContentUploadFormData extends BaseUploadFormData {
  fileContent: string;
  fileName: string;
}

type UploadFormData = FileUploadFormData | ContentUploadFormData;

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
    listDocumentSets: (page: number, pageSize: number) => Promise<{documents: DocumentSetMetadata[], total: number}> ,
    uploadCsv: (formData: UploadFormData) => Promise<{ success: true, documentSetId: number }>,
    generatePreviewData: (formData: UploadFormData) => Promise<{ success: boolean, nodes: Record<string, any>[], estimatedPrice: number, tokenCount: number, pricePer1M: number }>,
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
    getUploadProgress: () => Promise<{ progress: number, total: number }>;
  }
}
