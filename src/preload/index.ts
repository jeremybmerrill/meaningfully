import { contextBridge, ipcRenderer } from 'electron'
// import type { Settings } from './index.d'
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  listDocumentSets: (page?: number, pageSize?: number) => 
    ipcRenderer.invoke('list-document-sets', page, pageSize),
  getDocumentSet: (documentSetId: number) => ipcRenderer.invoke('get-document-set', documentSetId),
  deleteDocumentSet: (documentSetId: number) => ipcRenderer.invoke('delete-document-set', documentSetId),
  uploadCsv: (formData: {
      fileContent: string;
      fileName: string;
      datasetName: string,
      description: string,
      textColumns: string[],
      metadataColumns: string[],
      splitIntoSentences: boolean,
      combineSentencesIntoChunks: boolean,
      sploderMaxSize: number, 
      chunkSize: number,
      chunkOverlap: number,
    }) => {
    if (process.env.NODE_ENV === 'test') {
      formData["modelProvider"] = "mock"; // Ensure modelProvider is set to "mock" so we don't hit a paid API.
    }
    return ipcRenderer.invoke('upload-csv', formData);
  },
  // generatePreviewData and uploadCsv
  // should have exactly the same argument signatures, etc.
  // but different return types (because uploadCsv mutates the state of the
  // various databases returning an ID and generatePreviewData just returns a list of records)
  generatePreviewData: (formData: {
      fileContent: string;
      fileName: string;
      datasetName: string,
      description: string,
      textColumns: string[],
      metadataColumns: string[],
      splitIntoSentences: boolean,
      combineSentencesIntoChunks: boolean,
      sploderMaxSize: number, 
      chunkSize: number,
      chunkOverlap: number,
    }) => {
    return ipcRenderer.invoke('generate-preview-data', formData);
  },
  searchDocumentSet: (params: {
    documentSetId: number;
    query: string;
    n_results: number;
    filters?: Record<string, any>;
  }) => ipcRenderer.invoke('search-document-set', params),
  
  getDocument: (params: {
    documentSetId: number;
    documentId: string;
  }) => ipcRenderer.invoke('get-document', params),

  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: {  openAIKey: string;
    oLlamaBaseURL: string;
    azureOpenAIKey: string;
    azureOpenAIEndpoint: string;
    azureOpenAIApiVersion: string;
    mistralApiKey: string;
    geminiApiKey: string;
  }) => ipcRenderer.invoke('set-settings', settings),
  
  getUploadProgress: () => ipcRenderer.invoke('get-upload-progress')
})

// Expose electron utilities
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args)
    }
  },
  process: {
    versions: process.versions
  }
})