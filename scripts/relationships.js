import { loadDocumentsFromCsv } from "../src/main/services/csvLoader";
import { embedDocuments, persistNodes, getStorageContext } from "../src/main/services/embeddings";
import { join } from "path";
import { 
    VectorStoreIndex, 
    ModalityType,
    PGVectorStore,
    SimpleVectorStore,
  } from "llamaindex"
const settings = {
    openAIKey: process.env.OPENAI_API_KEY,
}

function sanitizeProjectName(projectName) {
    return projectName.replace(/[^a-zA-Z0-9]/g, "_");
  }
  

const config = {
    modelName: "text-embedding-3-small",
    modelProvider: "openai",
    splitIntoSentences: true,
    combineSentencesIntoChunks: true,
    sploderMaxSize: 100, // TODO: make configurable
    vectorStoreType: "simple",
    projectName: "whatever",
    storagePath:  join("/Users/jeremybmerrill/Library/Application Support/meaningfully", 'simple_vector_store'),
    chunkSize: 100,
    chunkOverlap: 10,
};

// this is just createEmbeddings
const documents = await loadDocumentsFromCsv("/Users/jeremybmerrill/code/meaningfully/sample-data/search_warrants_for_ner_from_rss.csv", "case_name");
// if (documents.length === 0) {
//     return {
//     success: false,
//     error: "That CSV does not appear to contain any documents. Please check the file and try again.",
//     };
// }
const nodes = await embedDocuments(documents, config, settings);


// this is persistNodes()
// Create and configure vector store based on type
console.time("persistNodes Run Time");
const storageContext = await getStorageContext(config, settings);
const vectorStore = storageContext.vectorStores[ModalityType.TEXT];
// Create index and embed documents
const index = await VectorStoreIndex.init({ 
    nodes, 
    storageContext, 
    logProgress: true
});
// storageContext.docStore.addDocuments(documents) // NEW TO persistNodes()

// // I'm not sure why this explicit call to persist is necessary. 
// // storageContext should handle this, but it doesn't.
// // all the if statements are just type-checking boilerplate.
// if (vectorStore) {
//     if (vectorStore instanceof PGVectorStore || vectorStore instanceof SimpleVectorStore) {
//     await vectorStore.persist(join(config.storagePath, sanitizeProjectName(config.projectName), "vector_store.json"));
//     } else {
//     throw new Error("Vector store does not support persist method");
//     }
// } else {
//     throw new Error("Vector store is undefined");
// }
// console.timeEnd("persistNodes Run Time");
// end of persistNodes

console.log(nodes[0])
console.log(nodes[0].relationships)


console.log("document", 
    await storageContext.docStore.getDocument(
        nodes[0].relationships.SOURCE.nodeId
    )
)