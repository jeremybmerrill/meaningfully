import { createEmbeddings } from '../src/main/api/embedding';
import { DocumentSetManager } from '../src/main/DocumentSetManager';

async function main() {
    try {
        // path is relative to where the script is run from, not script location
        const storagePath = './storage'
        const manager = new DocumentSetManager(storagePath);
        const projectName = "test"
        const description = "test description"
        const textColumns = ["case_name"]
        const metadataColumns = ["case_id"]
        const setId = await manager.addDocumentSet({
            name: projectName,
            uploadDate: new Date(),
            parameters: {
              description: description,
              textColumns: textColumns,
              metadataColumns: metadataColumns
            },
            totalDocuments: 0 // We'll update this after processing
          });
      

        const result = await createEmbeddings('../../sample-data/search_warrants_for_ner_from_rss.csv', textColumns[0], {
            modelName: 'text-embedding-3-small',
            useSploder: true,
            sploderMaxSize: 100,
            vectorStoreType: 'simple',
            projectName: 'test',
            storagePath: storagePath // relative to where the script is run from
          });
        console.log('Embeddings result:', result);
        console.log('Document set ID:', setId);
    } catch (error) {
        console.error('Error creating embeddings:', error);
    }
}

main(); 