import { DocumentSetManager } from './DocumentSetManager';
import { loadDocumentsFromCsv } from './services/csvLoader';
import { createEmbeddings, getIndex, search, previewResults, getDocStore } from './api/embedding';
import { app } from 'electron';
import { join } from 'path';
import { DocumentSetParams, Settings, MetadataFilter } from './types';
import fs from 'fs';

type HasFilePath = {filePath: string};
type DocumentSetParamsFilePath = DocumentSetParams & HasFilePath;

export class DocumentService {
  private manager: DocumentSetManager;

  constructor() {
    this.manager = new DocumentSetManager(app.getPath('userData'))
  }

  async listDocumentSets() {
    return await this.manager.getDocumentSets();
  }

  async getDocumentSet(documentSetId: number) {
    return await this.manager.getDocumentSet(documentSetId);
  }
  async deleteDocumentSet(documentSetId: number) {
    // Delete the document set from the database
    const result = await this.manager.getDocumentSet(documentSetId);
    if (result){
      // Delete the document set from the database
      await this.manager.deleteDocumentSet(documentSetId);
      // Delete the associated files from the filesystem
      fs.rmSync(join(app.getPath('userData'), 'simple_vector_store', result.name), { recursive: true, force: true });
    }
    return { success: true };
  }


  async generatePreviewData(data: DocumentSetParamsFilePath) {
    try {
      return await previewResults(data.filePath, data.textColumns[0], {
        modelName: data.modelName, // needed to tokenize, estimate costs
        modelProvider: data.modelProvider,
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
    const documentSetId = await this.manager.addDocumentSet({
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

    const embedSettings = await this.manager.getSettings()

    // Load and process the documents
    try {
      // Process each text column
      for (const textColumn of data.textColumns) {
        const documents = await loadDocumentsFromCsv(data.filePath, textColumn);
        
        // Update total documents count
        await this.manager.updateDocumentCount(documentSetId, documents.length);

        // Create embeddings for this column
        let ret = await createEmbeddings(data.filePath, textColumn, {
          modelName: data.modelName,
          modelProvider: data.modelProvider,
          splitIntoSentences: data.splitIntoSentences,
          combineSentencesIntoChunks: data.combineSentencesIntoChunks,
          sploderMaxSize: 100, // TODO: make configurable
          vectorStoreType: "simple",
          projectName: data.datasetName,
                        // via https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
          storagePath:  join(app.getPath('userData'), 'simple_vector_store'),
          chunkSize: data.chunkSize,
          chunkOverlap: data.chunkOverlap,
        }, embedSettings);
        if (!ret.success) {
          throw new Error(ret.error);
        }
      }
      return { success: true, documentSetId };
    } catch (error) {
      // If something fails, we should probably delete the document set
      await this.manager.deleteDocumentSet(documentSetId);
      console.error("deleting document set due to failure ", documentSetId, error);
      throw error;
    }
  }


  async searchDocumentSet(documentSetId: number, query: string, n_results: number = 10,   filters?: MetadataFilter[]  ) {
    const documentSet = await this.manager.getDocumentSet(documentSetId);
    const settings = await this.manager.getSettings();
    if (!documentSet) {
      throw new Error('Document set not found');
    } 
    const index = await getIndex({
      modelName: documentSet.parameters.modelName as string,
      modelProvider: documentSet.parameters.modelProvider as string,
      splitIntoSentences: documentSet.parameters.splitIntoSentences as boolean,
      combineSentencesIntoChunks: documentSet.parameters.combineSentencesIntoChunks as boolean,
      sploderMaxSize: 100,
      vectorStoreType: 'simple',
      projectName: documentSet.name,
      storagePath: join(app.getPath('userData'), 'simple_vector_store'),
      chunkSize: 1024, // not actually used, we just re-use a config object that has this option
      chunkOverlap: 20, // not actually used, we just re-use a config object that has this option
    }, settings);
    const results = await search(index, query, n_results, filters);
    return results;
  }   

  async getDocument(documentSetId: number, documentNodeId: string){
    const documentSet = await this.manager.getDocumentSet(documentSetId);
    if (!documentSet) {
      throw new Error('Document set not found');
    } 
    const docStore = await getDocStore({
      modelName: documentSet.parameters.modelName as string,
      modelProvider: documentSet.parameters.modelProvider as string,
      splitIntoSentences: documentSet.parameters.splitIntoSentences as boolean,
      combineSentencesIntoChunks: documentSet.parameters.combineSentencesIntoChunks as boolean,
      sploderMaxSize: 100,
      vectorStoreType: 'simple',
      projectName: documentSet.name,
      storagePath: join(app.getPath('userData'), 'simple_vector_store'),
      chunkSize: 1024, // not actually used, we just re-use a config object that has this option
      chunkOverlap: 20, // not actually used, we just re-use a config object that has this option
    });
    const document = await docStore.getNode(documentNodeId);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }


  async getSettings() {
    return this.manager.getSettings();
  }
  async setSettings(settings: Settings) {
    return this.manager.setSettings(settings);
  } 

}