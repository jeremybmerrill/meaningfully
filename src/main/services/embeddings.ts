import { 
  Document, 
  VectorStoreIndex, 
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
import { WeaviateVectorStore } from '@llamaindex/weaviate';
import { Sploder } from "./sploder";
import { CustomSentenceSplitter } from "./sentenceSplitter";
import { MockEmbedding } from "./mockEmbedding";
import { encodingForModel, TiktokenModel } from "js-tiktoken";
import { join } from "path";
import { EmbeddingConfig, Settings, MetadataFilter, Clients  } from "../types";
import { sanitizeProjectName, capitalizeFirstLetter } from "../utils";
import * as fs from 'fs';
import { ProgressOpenAIEmbedding } from "./progressOpenAIEmbedding";
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


/* all transformations except the embedding step (which is handled by VectorStoreIndex.init) */
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

export function estimateCost(nodes: TextNode[], modelName: string): {
  estimatedPrice: number;
  tokenCount: number;
  pricePer1M: number;
} {
  const tokenizer = encodingForModel(modelName as TiktokenModel);
  
  const tokenCount = nodes.reduce((sum, node) => {
    return sum + tokenizer.encode(node.text).length;
  }, 0);

  const estimatedPrice = tokenCount * (PRICE_PER_1M[modelName] / 1_000_000);

  return {
    estimatedPrice,
    tokenCount,
    pricePer1M: PRICE_PER_1M[modelName]
  };
}

export async function getExistingVectorStoreIndex(config: EmbeddingConfig, settings: Settings, clients: Clients, progressCallback?: (progress: number, total: number) => void) {
  const embedModel = getEmbedModel(config, settings, progressCallback);
  switch (config.vectorStoreType) {
    case "simple":
      const persistDir = join(config.storagePath, 'simple_vector_store', sanitizeProjectName(config.projectName));
      const storageContext = await storageContextFromDefaults({
        persistDir: persistDir,
      });
      let vsi = await VectorStoreIndex.init({
        storageContext: storageContext,
      });
      vsi.embedModel = embedModel;
      return vsi;

    case "postgres":
      if (!clients.postgresClient) {
        throw new Error("Postgres client required but not provided");
      }
      const pgStore = new PGVectorStore({
        clientConfig: { connectionString: process.env.POSTGRES_CONNECTION_STRING }, 
        tableName: sanitizeProjectName(config.projectName),
        dimensions: MODEL_DIMENSIONS[config.modelName],
        embeddingModel: embedModel
      });
      const pgStorageContext = await storageContextFromDefaults({
        vectorStores: { [ModalityType.TEXT]: pgStore },
      });
      return await VectorStoreIndex.init({
        storageContext: pgStorageContext,
      });
    case "weaviate":
      if (!clients.weaviateClient) {
        throw new Error("Weaviate client required but not provided");
      }
      const weaviateStore = new WeaviateVectorStore({
        indexName: capitalizeFirstLetter(sanitizeProjectName(config.projectName)),
        weaviateClient: clients.weaviateClient,
        embeddingModel: embedModel
      });

      // WeaviateVectorStore's getNodeSimilarity method looks for distance, but current weaviate provides score
      // (WeaviateVectorStore would get `score` if we were doing hybrid search)
      // Overwrite the private getNodeSimilarity method to use 'score' from metadata
      // @ts-ignore
      weaviateStore.getNodeSimilarity = (entry, _similarityKey = "score") => {
        return  entry.metadata.score;
      }

      return await VectorStoreIndex.fromVectorStore(weaviateStore)

    default:
      throw new Error(`Unsupported vector store type: ${config.vectorStoreType}`);
  }
}

export async function getExistingDocStore(config: EmbeddingConfig) {
  // switch (config.vectorStoreType) {
  //   case "simple":
      const persistDir = join(config.storagePath, sanitizeProjectName(config.projectName) );
      const storageContext = await storageContextFromDefaults({
        persistDir: persistDir,
      });
      return storageContext.docStore;

  //   case "postgres":
  //     throw new Error(`Not yet implemented vector store type: ${config.vectorStoreType}`);
  //     // return await createVectorStore(config);
  //   default:
  //     throw new Error(`Unsupported vector store type: ${config.vectorStoreType}`);
  // }
}



export async function transformDocumentsToNodes(
  documents: Document[],
  config: EmbeddingConfig,
) {
  console.time("transformDocumentsToNodes Run Time");

  const transformations = getBaseTransformations(config);

  // llama-index stupidly includes all the metadata in the embedding, which is a waste of tokens
  // so we exclude everything except the text column from the embedding
  for (const document of documents) {
    document.excludedEmbedMetadataKeys = Object.keys(document.metadata);
  }
  console.time("transformDocumentsToNodes transformDocuments Run Time");
  // remove empty documents. we can't meaningfully embed these, so we're just gonna ignore 'em.
  // that might not ultimately be the right solution. 
  documents = documents.filter((document_) => document_.text && document_.text.length > 0);

  // Create nodes with sentence splitting and optional sploder
  const pipeline = new IngestionPipeline({
    transformations
  });

  const nodes = (await pipeline.run({documents: documents})) as TextNode[];

  console.timeEnd("transformDocumentsToNodes transformDocuments Run Time");
  console.timeEnd("transformDocumentsToNodes Run Time");  
  return nodes;
}

export function getEmbedModel(
  config: EmbeddingConfig, 
  settings: Settings,
  progressCallback?: (progress: number, total: number) => void
) {
  let embedModel; 
  if (config.modelProvider === "openai" ){
    embedModel = new ProgressOpenAIEmbedding({ model: config.modelName, apiKey: settings.openAIKey ? settings.openAIKey : undefined}, progressCallback );
    embedModel.chunkSize = 20;
  } else if (config.modelProvider === "ollama") {
    embedModel = new OllamaEmbedding({ model: config.modelName, config: {
      host: settings.oLlamaBaseURL ? settings.oLlamaBaseURL : undefined
    }, }); 
  } else if (config.modelProvider === "mock") {
    embedModel = new MockEmbedding();
  } else {
    throw new Error(`Unsupported embedding model provider: ${config.modelProvider}`);
  }
  return embedModel;
}

export async function getStorageContext(config: EmbeddingConfig, settings: Settings, clients: Clients, progressCallback?: (progress: number, total: number) => void): Promise<StorageContext> {
  const vectorStore = await createVectorStore(config, settings, clients, progressCallback);
  fs.mkdirSync(config.storagePath, { recursive: true }); 
  const persistDir = join(config.storagePath, sanitizeProjectName(config.projectName) );
  return await storageContextFromDefaults({
    persistDir: persistDir,
    vectorStores: {[ModalityType.TEXT]: vectorStore}
  });
}

export async function persistDocuments(documents: Document[], config: EmbeddingConfig, settings: Settings, clients: Clients): Promise<void> {
  console.time("persistDocuments Run Time");
  const storageContext = await getStorageContext(config, settings, clients);
  await storageContext.docStore.addDocuments(documents, true);
  console.timeEnd("persistDocuments Run Time");
}

export async function persistNodes(nodes: TextNode[], config: EmbeddingConfig, settings: Settings, clients: Clients, progressCallback?: (progress: number, total: number) => void): Promise<VectorStoreIndex> { 
  // Create and configure vector store based on type
  console.time("persistNodes Run Time");

  const storageContext = await getStorageContext(config, settings, clients, progressCallback);
  const vectorStore = storageContext.vectorStores[ModalityType.TEXT];
  if (!vectorStore) {
    throw new Error("Vector store is undefined");
  }
  // Create index and embed documents
  // this is what actaully embeds the nodes
  // (even if they already have embeddings, stupidly)
  const index = await VectorStoreIndex.init({ 
    nodes, 
    storageContext, 
    logProgress: true
  });

  // I'm not sure why this explicit call to persist is necessary. 
  // storageContext should handle this, but it doesn't.
  // all the if statements are just type-checking boilerplate.
  // N.B. WeaviateVectorStore does not need to be explicitly persisted, so we don't include it in the OR conditional here..
  if (vectorStore) {
    if (vectorStore instanceof PGVectorStore || vectorStore instanceof SimpleVectorStore) {
      await vectorStore.persist(join(config.storagePath, sanitizeProjectName(config.projectName), "vector_store.json"));
    } else if (vectorStore instanceof WeaviateVectorStore) {
      // WeaviateVectorStore does not have a persist method, it persists automatically
      // so we don't need to do anything here.
      console.log("Pretending to persist Weaviate vector store, but it actually persists automatically.");
    } else {
      throw new Error("Vector store does not support persist method");
    }
  } else {
    throw new Error("Vector store is undefined");
  }
  console.timeEnd("persistNodes Run Time");
  return index;
}

async function createVectorStore(config: EmbeddingConfig, settings: Settings, clients: Clients, progressCallback?: (progress: number, total: number) => void): Promise<PGVectorStore | SimpleVectorStore | WeaviateVectorStore> {
  const embeddingModel = getEmbedModel(config, settings, progressCallback);
  switch (config.vectorStoreType) {

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

    case "weaviate": 
      const vectorStore = new WeaviateVectorStore({ 
        indexName: capitalizeFirstLetter(sanitizeProjectName(config.projectName)), 
        weaviateClient: clients.weaviateClient, 
        embeddingModel: embeddingModel 
      });

      // WeaviateVectorStore's getNodeSimilarity method looks for distance, but current weaviate provides score
      // (WeaviateVectorStore would get `score` if we were doing hybrid search)
      // Overwrite the private getNodeSimilarity method to use 'score' from metadata
      // @ts-ignore
      vectorStore.getNodeSimilarity = (entry, _similarityKey = "score") => {
        return  entry.metadata.score;
      }

      return vectorStore;
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
