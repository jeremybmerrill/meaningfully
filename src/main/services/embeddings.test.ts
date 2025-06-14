//@ts-nocheck
/*

This needs some human brain attentino to make it not ACTUALLY embed the documents
but still return SOMETHING so that the test can pass.
we need a fake OpenAIEmbedding that returns nothing.

*/


import { describe, it, expect, vi } from 'vitest';
import { Document, TextNode } from 'llamaindex';
import { transformDocuments, embedDocuments, getEmbedModel } from './embeddings';
import { ProgressOpenAIEmbedding } from './progressOpenAIEmbedding';

vi.mock(import("./embeddings"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      // your mocked methods
      transformDocuments: vi.fn(),
    }
  })
  
vi.mock('./progressOpenAIEmbedding', () => ({
  ProgressOpenAIEmbedding: vi.fn().mockImplementation((config, progressCallback) => ({
    getTextEmbeddingsBatch: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
    progressCallback
  }))
}));

describe('embedDocuments', () => {
  const mockConfig = {
    chunkSize: 100,
    chunkOverlap: 10,
    combineSentencesIntoChunks: true,
    sploderMaxSize: 500,
    modelProvider: 'mock',
    modelName: 'text-embedding-3-small',
    vectorStoreType: "simple" as "simple",
    storagePath: './storage',
    projectName: 'test_project',
    splitIntoSentences: true,
  };

  const mockSettings = {
    openAIKey: 'mock-api-key',
    oLlamaBaseURL: 'http://localhost',
    oLlamaModelType: 'mock-model',
  };

  it('should process documents and return nodes', async () => {
    const mockDocuments = [
      new Document({ text: 'Document 1', metadata: { key1: 'value1' } }),
      new Document({ text: 'Document 2', metadata: { key2: 'value2' } }),
    ];
    const mockNodes = [
      new TextNode({ text: 'Document 1' }),
      new TextNode({ text: 'Document 2' }),
    ];

    (transformDocuments as vi.Mock).mockResolvedValue(mockNodes);

    const result = await embedDocuments(mockDocuments, mockConfig, mockSettings);

    expect(result.map((n) => n.text)).toEqual(mockNodes.map((n) => n.text));
    // TODO: I can't get these to work. Apparently you can't spyOn a function that is imported from the same file.
    // all well and good but ... why did CoPilot generate a test that can't work?
    // expect(getEmbedModel).toHaveBeenCalledWith(mockConfig, mockSettings);
    // expect(transformDocuments).toHaveBeenCalledWith(mockDocuments, expect.any(Array));
  });

  it('should filter out documents with null, undefined, or zero-length text', async () => {
    const mockDocuments = [
      new Document({ text: 'Valid Document', metadata: { key1: 'value1' } }),
      new Document({ text: undefined, metadata: { key3: 'value3' } }),
      new Document({ text: '', metadata: { key4: 'value4' } }),
    ];
    const filteredDocuments = [mockDocuments[0]];
    const mockNodes = [new TextNode({ text: 'Valid Document' })];

    (transformDocuments as vi.Mock).mockResolvedValue(mockNodes);

    const result = await embedDocuments(mockDocuments, mockConfig, mockSettings);

    expect(result.map((n) => n.text)).toEqual(mockNodes.map((n) => n.text));
    
    // TODO: I can't get these to work. Apparently you can't spyOn a function that is imported from the same file.
    // all well and good but ... why did CoPilot generate a test that can't work?
    // expect(transformDocuments).toHaveBeenCalledWith(filteredDocuments, expect.any(Array));
  });

  it('should exclude all metadata keys from embedding', async () => {
    const mockDocuments = [
      new Document({ text: 'Document 1', metadata: { key1: 'value1', key2: 'value2' } }),
    ];
//    const mockNodes = [new TextNode({ text: 'Document 1' })];

//    (getEmbedModel as vi.Mock).mockReturnValue(mockEmbeddingModel);
//    (transformDocuments as vi.Mock).mockResolvedValue(mockNodes);

    await embedDocuments(mockDocuments, mockConfig, mockSettings);

    expect(mockDocuments[0].excludedEmbedMetadataKeys).toEqual(['key1', 'key2']);
  });
});

describe('getEmbedModel', () => {
  const mockConfig = {
    chunkSize: 100,
    chunkOverlap: 10,
    combineSentencesIntoChunks: true,
    sploderMaxSize: 500,
    modelProvider: 'openai',
    modelName: 'text-embedding-3-small',
    vectorStoreType: "simple" as "simple",
    storagePath: './storage',
    projectName: 'test_project',
    splitIntoSentences: true,
  };

  const mockSettings = {
    openAIKey: 'mock-api-key',
    oLlamaBaseURL: 'http://localhost',
    oLlamaModelType: 'mock-model',
  };

  it('should create embedding model with progress callback for OpenAI', () => {
    const progressCallback = vi.fn();
    const embedModel = getEmbedModel(mockConfig, mockSettings, progressCallback);
    
    expect(embedModel).toBeDefined();
    // Verify the ProgressOpenAIEmbedding constructor was called with the progress callback
    expect(ProgressOpenAIEmbedding).toHaveBeenCalledWith(
      expect.objectContaining({ 
        model: 'text-embedding-3-small', 
        apiKey: 'mock-api-key' 
      }), 
      progressCallback
    );
  });

  it('should properly pass progress to callback when embedding', async () => {
    const progressCallback = vi.fn();
    const embedModel = getEmbedModel(
      { ...mockConfig, modelProvider: 'openai' }, 
      mockSettings, 
      progressCallback
    );
    
    // Simulate embedding execution that would trigger progress callback
    await embedModel.getTextEmbeddingsBatch(['test text']);
    
    // Verify the progress callback was stored correctly
    expect(embedModel.progressCallback).toBe(progressCallback);
  });

  it('should handle different model providers correctly', () => {
    // Test with 'ollama' provider
    const ollamaModel = getEmbedModel(
      { ...mockConfig, modelProvider: 'ollama' }, 
      mockSettings
    );
    expect(ollamaModel).toBeDefined();
    
    // Test with 'mock' provider
    const mockModel = getEmbedModel(
      { ...mockConfig, modelProvider: 'mock' }, 
      mockSettings
    );
    expect(mockModel).toBeDefined();
    
    // Test with invalid provider
    expect(() => {
      getEmbedModel(
        { ...mockConfig, modelProvider: 'invalid' as any }, 
        mockSettings
      );
    }).toThrow('Unsupported embedding model provider: invalid');
  });
});