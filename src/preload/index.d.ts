import { ElectronAPI } from '@electron-toolkit/preload'


// copy pasta from ../main/types/index.tx
export interface SearchResult {
  text: string;
  score: number;
  metadata: Record<string, any>;
  sourceNodeId?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  hasMore: boolean;
}

export interface EmbeddingResult {
  success: boolean;
  error?: string;
  index?: any;
}

export interface SampleDocument {
  text: string;
  metadata: Record<string, any>;
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
  // present on generatePreviewData's response so refinePreviewSample can be called later
  // without re-reading the source file
  documentCount?: number;
  sample?: SampleDocument[];
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
  elapsedTimeMs: number;
  estimatedTimeRemainingMs: number | null;
}

export interface BaseUploadFormData {
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

export interface UploadFormData extends BaseUploadFormData {
  fileContent: string;
  fileName: string;
}

export interface RefinePreviewSampleFormData extends BaseUploadFormData {
  sample: SampleDocument[];
  documentCount: number;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listDocumentSets: () => Promise<{documents: DocumentSetMetadata[], total: number}> ,
      getDocumentSet: (documentSetId: number) => Promise<DocumentSetMetadata>,
      uploadCsv: (formData: UploadFormData) => Promise<{ success: true, documentSetId: number }>,
      searchDocumentSet: (params: {
        documentSetId: number;
        query: string;
        n_results: number;
        offset?: number;
        filters?: { 
          key: string, 
          operator: "==" | "in" | ">" | "<" | "!=" | ">=" | "<=" | "nin" | "any" | "all" | "text_match" | "contains" | "is_empty", 
          value: any 
        }[];
      }) => Promise<SearchResponse>,
      getDocument(params: {
        documentSetId: number;
        documentId: string;
      }): Promise<{ text: string, metadata: Record<string, any> }>,
      getSettings: () => Promise<Settings>, 
      setSettings: (settings: Settings) => Promise<void>,
      deleteDocumentSet: (documentSetId: number) => Promise<{ success: boolean }>,
      generatePreviewData: (formData: UploadFormData) => Promise<PreviewResult>,
      refinePreviewSample: (formData: RefinePreviewSampleFormData) => Promise<PreviewResult>,
      getUploadProgress: () => Promise<UploadProgress>,
      getAvailableModelOptions: () => Promise<{
        availableModelOptions: Record<string, string[]>;
        allModelOptions: Record<string, string[]>;
      }>,
    }
  }
}