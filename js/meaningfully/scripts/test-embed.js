// const { createEmbeddings } = require('../src/main/api/embedding');
import { createEmbeddings } from '../src/main/api/embedding';

async function testEmbeddings() {
  try {
    const result = await createEmbeddings('../data/sample-data/wapo_opinion_headlines.csv', 'text', {
      modelName: 'text-embedding-3-small',
      useSploder: true,
      sploderMaxSize: 100,
      vectorStoreType: 'simple',
      projectName: 'test'
    });
    
    console.log('Embeddings created successfully:', result);
  } catch (error) {
    console.error('Error creating embeddings:', error);
  }
}

testEmbeddings();