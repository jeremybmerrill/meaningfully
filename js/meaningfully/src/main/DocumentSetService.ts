import { DocumentSetManager } from './DocumentSetManager';
import { loadDocumentsFromCsv } from './services/csvLoader';
import { createEmbeddings } from './api/embedding';
import { app } from 'electron';
import { join } from 'path';

export class DocumentService {
  private manager: DocumentSetManager;

  constructor() {
    this.manager = new DocumentSetManager(app.getPath('userData'));
  }

  async listDocumentSets() {
    const stmt = this.manager['sqliteDb'].prepare(`
      SELECT * FROM document_sets ORDER BY upload_date DESC
    `);
    
    const rows = stmt.all();
    return rows.map(row => ({
      setId: row.set_id,
      name: row.name,
      uploadDate: new Date(row.upload_date),
      parameters: JSON.parse(row.parameters),
      totalDocuments: row.total_documents
    }));
  }

  async uploadCsv(data: {
    filePath: string,
    datasetName: string,
    description: string,
    textColumns: string[],
    metadataColumns: string[]
  }) {
    // First create the document set record
    const setId = await this.manager.addDocumentSet({
      name: data.datasetName,
      uploadDate: new Date(),
      parameters: {
        description: data.description,
        textColumns: data.textColumns,
        metadataColumns: data.metadataColumns
      },
      totalDocuments: 0 // We'll update this after processing
    });

    // Load and process the documents
    try {
      // Process each text column
      for (const textColumn of data.textColumns) {
        const documents = await loadDocumentsFromCsv(data.filePath, textColumn);
        
        // Update total documents count
        await this.manager.updateDocumentCount(setId, documents.length);

        // Create embeddings for this column
        await createEmbeddings(data.filePath, textColumn, {
          modelName: "text-embedding-3-small", // Could make configurable
          useSploder: true,
          sploderMaxSize: 100, // TODO: make configurable
          vectorStoreType: "simple",
          projectName: data.datasetName,
                        // via https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
          storagePath:  join(app.getPath('userData'), 'simple_vector_store'),
        });
      }

      return { success: true, setId };
    } catch (error) {
      // If something fails, we should probably delete the document set
      await this.manager.deleteDocumentSet(setId);
      throw error;
    }
  }
}