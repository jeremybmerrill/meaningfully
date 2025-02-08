/// <reference types="svelte" />
/// <reference types="vite/client" />


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
      }) => Promise<{ success: true, setId: number }>
    }
  }
  