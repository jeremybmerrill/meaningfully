import { DocumentSetManager } from './DocumentSetManager';
import { loadDocumentsFromCsv } from './services/csvLoader';
import { createEmbeddings, getIndex, search, previewResults } from './api/embedding';
import { app } from 'electron';
import { join } from 'path';
import { DocumentSetParams } from './types';

type HasFilePath = {filePath: string};
type DocumentSetParamsFilePath = DocumentSetParams & HasFilePath;

export class DocumentService {
  private manager: DocumentSetManager;

  constructor() {
    this.manager = new DocumentSetManager(app.getPath('userData'))
  }

  async listDocumentSets() {
    const stmt = this.manager['sqliteDb'].prepare(`
      SELECT * FROM document_sets ORDER BY upload_date DESC
    `)
    
    const rows = stmt.all();
    return rows.map(row => ({
      setId: row.set_id,
      name: row.name,
      uploadDate: new Date(row.upload_date),
      parameters: JSON.parse(row.parameters),
      totalDocuments: row.total_documents
    }))
  }


  async generatePreviewData(data: DocumentSetParamsFilePath) {
    try {
      return await previewResults(data.filePath, data.textColumns[0], {
        modelName: data.modelName, // needed to tokenize, estimate costs
        splitIntoSentences: data.splitIntoSentences,
        combineSentencesIntoChunks: data.combineSentencesIntoChunks,
        sploderMaxSize: 100,
        vectorStoreType: 'simple',
        projectName: data.datasetName,
        storagePath: join(app.getPath('userData'), 'simple_vector_store'),
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap
    });
  } catch (error) {
    throw error;
  }
}

  async uploadCsv(data: DocumentSetParamsFilePath) {
    // First create the document set record
    const setId = await this.manager.addDocumentSet({
      name: data.datasetName,
      uploadDate: new Date(),
      parameters: {
        description: data.description,
        textColumns: data.textColumns,
        metadataColumns: data.metadataColumns,
        splitIntoSentences: data.splitIntoSentences,
        combineSentencesIntoChunks: data.combineSentencesIntoChunks,
        sploderMaxSize: data.sploderMaxSize,
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
        modelName: data.modelName,
        modelProvider: data.modelProvider
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
          splitIntoSentences: data.splitIntoSentences,
          combineSentencesIntoChunks: data.combineSentencesIntoChunks,
          sploderMaxSize: 100, // TODO: make configurable
          vectorStoreType: "simple",
          projectName: data.datasetName,
                        // via https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
          storagePath:  join(app.getPath('userData'), 'simple_vector_store'),
          chunkSize: data.chunkSize,
          chunkOverlap: data.chunkOverlap,
        });
      }

      return { success: true, setId };
    } catch (error) {
      // If something fails, we should probably delete the document set
      await this.manager.deleteDocumentSet(setId);
      throw error;
    }
  }


  async searchDocumentSet(documentSetId: number, query: string, n_results: number = 10) {
    const documentSet = await this.manager.getDocumentSet(documentSetId);
    if (!documentSet) {
      throw new Error('Document set not found');
    } 
    const index = await getIndex({
      modelName: documentSet.parameters.modelName as string,
      splitIntoSentences: documentSet.parameters.splitIntoSentences as boolean,
      combineSentencesIntoChunks: documentSet.parameters.combineSentencesIntoChunks as boolean,
      sploderMaxSize: 100,
      vectorStoreType: 'simple',
      projectName: documentSet.name,
      storagePath: join(app.getPath('userData'), 'simple_vector_store'),
      chunkSize: 1024, // not actually used, we just re-use a config object that has this option
      chunkOverlap: 20, // not actually used, we just re-use a config object that has this option
    });
    const results = await search(index, query, n_results);
    return results;
  }   
}