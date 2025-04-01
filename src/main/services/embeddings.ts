import { 
  Document, 
  VectorStoreIndex, 
  OpenAIEmbedding, 
  OllamaEmbedding,
  IngestionPipeline,
  TransformComponent,
  TextNode,
  ModalityType,
  MetadataFilters,
  PGVectorStore,
  storageContextFromDefaults,
  SimpleVectorStore,
  StorageContext
} from "llamaindex";
import { Sploder } from "./sploder";
import { CustomSentenceSplitter } from "./sentenceSplitter";
import { MockEmbedding } from "./mockEmbedding";
import { encodingForModel, TiktokenModel } from "js-tiktoken";
import { join } from "path";
import { EmbeddingConfig, Settings, MetadataFilter  } from "../types";
import * as fs from 'fs';

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

export async function getExistingVectorStoreIndex(config: EmbeddingConfig, settings: Settings) {
  const embedModel = getEmbedModel(config, settings);
  switch (config.vectorStoreType) {
    case "simple":
      const persistDir = join(config.storagePath, sanitizeProjectName(config.projectName) );
      const storageContext = await storageContextFromDefaults({
        persistDir: persistDir,
      });
      let vsi = await VectorStoreIndex.init({
        storageContext: storageContext,
      });
      vsi.embedModel = embedModel;
      return vsi;

    case "postgres":
      throw new Error(`Not yet implemented vector store type: ${config.vectorStoreType}`);
      // return await createVectorStore(config);
    default:
      throw new Error(`Unsupported vector store type: ${config.vectorStoreType}`);
  }
}

export async function getExistingDocStore(config: EmbeddingConfig) {
  switch (config.vectorStoreType) {
    case "simple":
      const persistDir = join(config.storagePath, sanitizeProjectName(config.projectName) );
      const storageContext = await storageContextFromDefaults({
        persistDir: persistDir,
      });
      return storageContext.docStore;

    case "postgres":
      throw new Error(`Not yet implemented vector store type: ${config.vectorStoreType}`);
      // return await createVectorStore(config);
    default:
      throw new Error(`Unsupported vector store type: ${config.vectorStoreType}`);
  }
}



export function getEmbedModel(config: EmbeddingConfig, settings: Settings) {
  let embedModel; 
  if (config.modelProvider === "openai" ){
    embedModel = new OpenAIEmbedding({ model: config.modelName, apiKey: settings.openAIKey ? settings.openAIKey : undefined }); 
  } else if (config.modelProvider === "ollama") {
    embedModel = new OllamaEmbedding({ model: config.modelName,     config: {
      host: settings.oLlamaBaseURL ? settings.oLlamaBaseURL : undefined
    }, }); 
  } else if (config.modelProvider === "mock") {
    embedModel = new MockEmbedding();
  } else {
    throw new Error(`Unsupported embedding model provider: ${config.modelProvider}`);
  }
  return embedModel;
}


// TODO: rename this to be parallel to createPreviewNodes
export async function embedDocuments(
  documents: Document[],
  config: EmbeddingConfig,
  settings: Settings
) {
  console.log(documents, "documents")
  const embedModel = getEmbedModel(config, settings);
  // Create embedding model
  // use the same transformations as previewNodes
  // but with the actual embedding step added
  const transformations = getBaseTransformations(config);
  transformations.push(embedModel)

  // llama-index stupidly includes all the metadata in the embedding, which is a waste of tokens
  // so we exclude everything except the text column from the embedding
  for (const document of documents) {
    document.excludedEmbedMetadataKeys = Object.keys(document.metadata);
  }

  // remove empty documents. we can't meaningfully embed these, so we're just gonna ignore 'em.
  // that might not ultimately be the right solution. 
  documents = documents.filter((document_) => document_.text && document_.text.length > 0);

  // Create nodes with sentence splitting and optional sploder
  const nodes = await transformDocuments(documents, transformations);
  return nodes;
}

export async function getStorageContext(config: EmbeddingConfig, settings: Settings): Promise<StorageContext> {
  const vectorStore = await createVectorStore(config, settings);
  fs.mkdirSync(config.storagePath, { recursive: true }); 
  const persistDir = join(config.storagePath, sanitizeProjectName(config.projectName) );
  return await storageContextFromDefaults({
    persistDir: persistDir,
    vectorStores: {[ModalityType.TEXT]: vectorStore}
  });
}

export async function persistDocuments(documents: Document[], config: EmbeddingConfig, settings: Settings): Promise<void> {
  console.time("persistDocuments Run Time");
  const storageContext = await getStorageContext(config, settings);
  await storageContext.docStore.addDocuments(documents, true);
  console.timeEnd("persistDocuments Run Time");
}

export async function persistNodes(nodes: TextNode[], config: EmbeddingConfig, settings: Settings): Promise<VectorStoreIndex> { 
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
  // I'm not sure why this explicit call to persist is necessary. 
  // storageContext should handle this, but it doesn't.
  // all the if statements are just type-checking boilerplate.
  if (vectorStore) {
    if (vectorStore instanceof PGVectorStore || vectorStore instanceof SimpleVectorStore) {
      await vectorStore.persist(join(config.storagePath, sanitizeProjectName(config.projectName), "vector_store.json"));
    } else {
      throw new Error("Vector store does not support persist method");
    }
  } else {
    throw new Error("Vector store is undefined");
  }
  console.timeEnd("persistNodes Run Time");
  return index;
}

async function createVectorStore(config: EmbeddingConfig, settings: Settings): Promise<PGVectorStore | SimpleVectorStore> {
  const embeddingModel = getEmbedModel(config, settings);
  switch (config.vectorStoreType) {
    // case "chroma":
    //   // not gonna work, requires a 'server' to run this elsewhere
    //   return new ChromaVectorStore({
    //     collectionName: config.projectName,
    //   });

    // for some reason the embedding model has to be specified here TOO
    // otherwise it defaults to Ada.

    case "postgres":
      return new PGVectorStore({
        clientConfig: {connectionString: process.env.POSTGRES_CONNECTION_STRING},
        tableName: sanitizeProjectName(config.projectName),
        dimensions: MODEL_DIMENSIONS[config.modelName],
        embeddingModel: embeddingModel
      });

    case "simple":
      return new SimpleVectorStore({embeddingModel: embeddingModel});

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
  numResults: number = 10,
  filters?: MetadataFilter[]
) {
  // const metadataFilters: MetadataFilters | undefined = filters ? {filters: filters} : undefined;
  const metadataFilters: MetadataFilters = {
    filters: filters ? filters : [],
  };
  const retriever = index.asRetriever({ similarityTopK: numResults, filters: metadataFilters });

  const results = await retriever.retrieve(query );
  return results;
}
