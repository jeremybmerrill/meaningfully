import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  listDocumentSets: () => ipcRenderer.invoke('list-document-sets'),
  uploadCsv: (formData: {
    file: File,
    datasetName: string,
    description: string,
    textColumns: string[],
    metadataColumns: string[]
  }) => {
    // Convert File object to a format that can be sent over IPC
    const { file, ...rest } = formData;
    return ipcRenderer.invoke('upload-csv', {
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
    filters?: Record<string, string>;
  }) => ipcRenderer.invoke('search-document-set', params)
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
