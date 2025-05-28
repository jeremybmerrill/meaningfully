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
  }) => {
    // Convert File object to a format that can be sent over IPC
    if (process.env.NODE_ENV === 'test') {
      formData["modelProvider"] = "mock"; // Ensure modelProvider is set to "mock" so we don't hit a paid API.
    }
    const { file, ...rest } = formData;
    return ipcRenderer.invoke('upload-csv', {
      ...rest,
      file: {
        name: file.name,
        path: file.path
      }
    });
  },
  // generatePreviewData and uploadCsv
  // should have exactly the same argument signatures, etc.
  // but different return types (because uploadCsv mutates the state of the
  // various databases returning an ID and generatePreviewData just returns a list of records)
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
  }) => {
    const { file, ...rest } = formData;
    return ipcRenderer.invoke('generate-preview-data', {
      ...rest,
      file: {
        name: file.name,
        path: file.path
      }
    });
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
    oLlamaModelType: string;
    oLlamaBaseURL: string;
  }) => ipcRenderer.invoke('set-settings', settings)
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