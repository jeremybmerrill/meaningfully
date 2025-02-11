import { 
  Document, 
  VectorStoreIndex, 
  OpenAIEmbedding, 
  IngestionPipeline,
  TransformComponent,
  TextNode,
  ModalityType,
  // ChromaVectorStore,
  PGVectorStore,
  storageContextFromDefaults,
  SimpleVectorStore,
} from "llamaindex";
// import { WeaviateVectorStore } from "@llamaindex/weaviate";
// import weaviate, { EmbeddedOptions } from 'weaviate-ts-embedded';
// import { Sploder } from "./sploder";
import { CustomSentenceSplitter } from "./sentenceSplitter";
import { encodingForModel } from "js-tiktoken";
import { TiktokenModel } from "js-tiktoken";
import { join } from "path";

export interface EmbeddingConfig {
  modelName: string;
  useSploder: boolean;
  sploderMaxSize: number;
  vectorStoreType: "simple" | "postgres" ; // # "chroma" | "duckdb" | "postgres" | "weaviate";
  projectName: string;
  storagePath: string;
}

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

function getPreviewTransformations(config: EmbeddingConfig){
  const transformations: TransformComponent[] = [
    new CustomSentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
  ];

  if (config.useSploder) {
    // TODO: fix this
    // transformations.push(
    //   new Sploder({
    //     maxStringTokenCount: config.sploderMaxSize
    //   })
    // );
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

  const transformations = getPreviewTransformations(config);
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
      const persistDir = join(config.storagePath, config.projectName);
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

export async function embedDocuments(
  documents: Document[],
  config: EmbeddingConfig
) {

  // Create embedding model
  const embedModel = new OpenAIEmbedding({ model: config.modelName });

  // use the same transformations as previewNodes
  // but with the actual embedding step added
  // TODO: make this a method parallel to getPreviewNodes()
  const transformations = getPreviewTransformations(config);
  transformations.push(embedModel)

  // Create nodes with sentence splitting and optional sploder
  const nodes = await transformDocuments(documents, transformations);

  // Create and configure vector store based on type
  const vectorStore = await createVectorStore(config);

  const storageContext = await storageContextFromDefaults({
    persistDir: join(config.storagePath, config.projectName),
    vectorStores: {[ModalityType.TEXT]: vectorStore}
  });

  // Create index and embed documents
  const index = await VectorStoreIndex.init({ 
    nodes, 
    storageContext, 
  });
  // I'm not sure this why is necessary. 
  // storageContext should handle this, but it doesn't.
  await  vectorStore.persist(join(config.storagePath, config.projectName, "vector_store.json"))
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
        tableName: config.projectName,
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