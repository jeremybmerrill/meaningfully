import { ElectronAPI } from '@electron-toolkit/preload'
import { DocumentSetMetadata } from '../main/DocumentSetManager'

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
      }) => Promise<{ success: true, setId: number }>
    },
    api2: {
      listDocumentSets: () => Promise<DocumentSetMetadata[]>,
    }
  }
}
