import { 
  Document, 
  VectorStoreIndex, 
  OpenAIEmbedding, 
  IngestionPipeline,
  TransformComponent,
  TextNode,
  ModalityType,
  PGVectorStore,
  storageContextFromDefaults,
  SimpleVectorStore,
} from "llamaindex";
import { Sploder } from "./sploder";
import { CustomSentenceSplitter } from "./sentenceSplitter";
import { encodingForModel } from "js-tiktoken";
import { TiktokenModel } from "js-tiktoken";
import { join } from "path";
import { EmbeddingConfig } from "../types";
// import { LoggingOpenAIEmbedding } from "./loggingOpenAIEmbedding"; // for debug only

// unused, but probalby eventually will be used.
// to be used by postgres store, which it' slooking increasingly like I have to enable again
const MODEL_DIMENSIONS = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
};

const PRICE_PER_1M = {
  "text-embedding-3-small": 0.02,
  "text-embedding-3-large": 0.13
};

function sanitizeProjectName(projectName: string) {
  return projectName.replace(/[^a-zA-Z0-9]/g, "_");
}

/* all transformations except the embedding step (which costs money) */
function getBaseTransformations(config: EmbeddingConfig){
  const transformations: TransformComponent[] = [
    new CustomSentenceSplitter({ chunkSize: config.chunkSize, chunkOverlap: config.chunkOverlap }),
  ];

  if (config.combineSentencesIntoChunks) {
    transformations.push(
      new Sploder({
        maxStringTokenCount: config.sploderMaxSize
      })
    );
  }

  return transformations;
}

export async function transformDocuments(documents: Document[], transformations: TransformComponent[]): Promise<TextNode[]> {
  const pipeline = new IngestionPipeline({
    transformations
  });

  return (await pipeline.run({documents: documents})) as TextNode[];
}

export async function createPreviewNodes(
  documents: Document[],
  config: EmbeddingConfig
): Promise<TextNode[]> {

  const transformations = getBaseTransformations(config);
  return transformDocuments(documents, transformations);
}

export function estimateCost(nodes: TextNode[], modelName: string): {
  estimatedPrice: number;
  tokenCount: number;
} {
  const tokenizer = encodingForModel(modelName as TiktokenModel);
  
  const tokenCount = nodes.reduce((sum, node) => {
    return sum + tokenizer.encode(node.text).length;
  }, 0);

  const estimatedPrice = tokenCount * (PRICE_PER_1M[modelName] / 1_000_000);

  return {
    estimatedPrice,
    tokenCount
  };
}

export async function getExistingVectorStoreIndex(config: EmbeddingConfig) {
  switch (config.vectorStoreType) {
    case "simple":
      const persistDir = join(config.storagePath, sanitizeProjectName(config.projectName) );
      const storageContext = await storageContextFromDefaults({
        persistDir: persistDir,
      });
      return await VectorStoreIndex.init({
        storageContext: storageContext,
      });

      case "postgres":
      throw new Error(`Not yet implemented vector store type: ${config.vectorStoreType}`);
      // return await createVectorStore(config);
    default:
      throw new Error(`Unsupported vector store type: ${config.vectorStoreType}`);
  }
}

// TODO: rename this to be parallel to createPreviewNodes
export async function embedDocuments(
  documents: Document[],
  config: EmbeddingConfig
) {

  // Create embedding model
  const embedModel = new OpenAIEmbedding({ model: config.modelName });

  // use the same transformations as previewNodes
  // but with the actual embedding step added
  const transformations = getBaseTransformations(config);
  transformations.push(embedModel)

  // llama-index stupidly includes all the metadata in the embedding, which is a waste of tokens
  // so we exclude everything except the text column from the embedding
  for (const document of documents) {
    document.excludedEmbedMetadataKeys = Object.keys(document.metadata);
  }

  // Create nodes with sentence splitting and optional sploder
  const nodes = await transformDocuments(documents, transformations);
  return nodes;
}

export async function persistNodes(nodes: TextNode[], config: EmbeddingConfig): Promise<VectorStoreIndex> { 
  // Create and configure vector store based on type
  const vectorStore = await createVectorStore(config);

  const storageContext = await storageContextFromDefaults({
    persistDir: join(config.storagePath, sanitizeProjectName(config.projectName)),
    vectorStores: {[ModalityType.TEXT]: vectorStore}
  });

  // Create index and embed documents
  const index = await VectorStoreIndex.init({ 
    nodes, 
    storageContext, 
  });
  // I'm not sure this why is necessary. 
  // storageContext should handle this, but it doesn't.
  await  vectorStore.persist(join(config.storagePath, sanitizeProjectName(config.projectName), "vector_store.json"))
  return index;
}

async function createVectorStore(config: EmbeddingConfig) {
  switch (config.vectorStoreType) {
    // case "chroma":
    //   // not gonna work, requires a 'server' to run this elsewhere
    //   return new ChromaVectorStore({
    //     collectionName: config.projectName,
    //   });

    case "postgres":
      return new PGVectorStore({
        clientConfig: {connectionString: process.env.POSTGRES_CONNECTION_STRING},
        tableName: sanitizeProjectName(config.projectName),
        dimensions: MODEL_DIMENSIONS[config.modelName],
      });

    case "simple":
      return new SimpleVectorStore({
        //persistDir: join(app.getPath('userData'), 'simple_vector_store', config.projectName),
      });

    // case "weaviate": 
    // oddly the WeaviateClient from the embedded client doesn't define the same interface as the client from regular Weaviate
    // which is what WeaviateVectorStore expects 
    // TODO: figure this out.
    // Vectra might be good, but there is no VectraVectorStore

    //   const client = weaviate.client(new EmbeddedOptions({env: {persistence_data_path:  join(app.getPath('userData'), 'weaviate_store', config.projectName)}}));
      
    //   await client.embedded.start();
    
    //   return new WeaviateVectorStore({
    //     weaviateClient: client
    //   });

    default:
      throw new Error(`Unsupported vector store type: ${config.vectorStoreType}`);
  }
}

export async function searchDocuments(
  index: VectorStoreIndex,
  query: string,
  numResults: number = 10
) {
  const retriever = index.asRetriever({ similarityTopK: numResults });
  const results = await retriever.retrieve(query);
  return results;
} 