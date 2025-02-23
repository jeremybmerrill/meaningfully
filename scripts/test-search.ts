import { search, getIndex } from '../src/main/api/embedding';
import { DocumentSetManager } from '../src/main/DocumentSetManager';
import assert from 'assert';
async function main() {
    try {
        // path is relative to where the script is run from, not script location
        const storagePath = './storage'
        const manager = new DocumentSetManager(storagePath);
        const projectName = "test2"
        const projectdocumentSetId = 2

        const documentSetMetadata = await manager.getDocumentSet(projectdocumentSetId);
        assert.equal(documentSetMetadata?.name, projectName);

        const index = await getIndex({
            modelName: 'text-embedding-3-small',
            combineSentencesIntoChunks: true,
            sploderMaxSize: 100,
            vectorStoreType: 'simple',
            projectName: projectName,
            storagePath: storagePath, // relative to where the script is run from
            chunkSize: 100,
            chunkOverlap: 20,
            splitIntoSentences: true
        })
        const results = await search(index, "someone's FB page", 10);
        console.log('results:', results);
    } catch (error) {
        console.error('Error creating embeddings:', error);
    }
}

main(); 