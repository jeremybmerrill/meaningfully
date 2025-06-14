import weaviate, { EmbeddedOptions, EmbeddedDB } from 'weaviate-ts-embedded';
import path from 'path';

export async function create_weaviate_database(storagePath: string) {
    let embedded_db: any = null;
  
    const embeddedOptions = new EmbeddedOptions({
      host: '127.0.0.1',
      port: 9898,
      persistenceDataPath: path.join(storagePath, "weaviate_data"),
    });
    
    embedded_db = new EmbeddedDB(embeddedOptions);
    await embedded_db.start();
    
    const client = await weaviate.client(embeddedOptions,   {
    //   scheme: 'http',
      host: '127.0.0.1',
      port: 9898
    });
    client.embedded = embedded_db;
    console.log('Weaviate binary:', client.embedded.options.binaryPath);
    console.log('Weaviate data path:', client.embedded.options.persistenceDataPath);
    
    console.info('\nEmbedded DB started\n');
    return client
  }
  

export async function teardown_weaviate_database(client) {
  if (client) {
    await client.embedded.stop();
  }
}