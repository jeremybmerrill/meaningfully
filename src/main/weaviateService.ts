import weaviate, { EmbeddedOptions, EmbeddedDB } from 'weaviate-ts-embedded';
import path from 'path';
import fs from 'fs';

function findWeaviate() {
  const possibilities = [
    // In packaged app
    path.join(process.resourcesPath, "resources", "weaviate", "weaviate-embedded-latest"),
    // In development
    path.join(__dirname, "resources", "weaviate", "weaviate-embedded-latest"),
  ];
  for (const path of possibilities) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  return undefined;
}

export async function create_weaviate_database(storagePath: string) {
    let embedded_db: any = null;
  
    const embeddedOptions = new EmbeddedOptions({
      host: '127.0.0.1',
      port: 9898,
      persistenceDataPath: path.join(storagePath, "weaviate_data"),
      binaryPath: findWeaviate(),
      // Without this, a single embedded node can wait indefinitely for raft to see
      // enough peers before it elects a leader, surfacing as "leader not found" on
      // any schema read/write shortly after startup.
      env: { RAFT_BOOTSTRAP_EXPECT: '1' }
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