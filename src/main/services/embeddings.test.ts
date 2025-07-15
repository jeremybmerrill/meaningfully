//@ts-nocheck

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Document, TextNode } from 'llamaindex';

// First, set up the mock before importing the module
vi.mock(import("./embeddings"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // your mocked methods
    estimateCost: vi.fn(),
    getExistingVectorStoreIndex: vi.fn(),
    persistNodes: vi.fn(),
    persistDocuments: vi.fn(),
    getExistingDocStore: vi.fn(),
    searchDocuments: vi.fn()
  }
})

// Now import the mocked functions
import { transformDocumentsToNodes, getEmbedModel } from './embeddings';

describe('transformDocumentsToNodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    azureOpenAIKey: null,
    azureOpenAIEndpoint: null,
    azureOpenAIApiVersion: null,
    mistralApiKey: null,
    geminiApiKey: null,
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

    const result = await transformDocumentsToNodes(mockDocuments, mockConfig, mockSettings);

    expect(result.map((node) => node.text)).toEqual(mockNodes.map((node) => node.text));
  });

  it('should filter out documents with null, undefined, or zero-length text', async () => {
    const mockDocuments = [
      new Document({ text: 'Valid Document', metadata: { key1: 'value1' } }),
      new Document({ text: undefined, metadata: { key3: 'value3' } }),
      new Document({ text: '', metadata: { key4: 'value4' } }),
    ];
    const filteredDocuments = [mockDocuments[0]];
    const mockNodes = [new TextNode({ text: 'Valid Document' })];

    // (transformDocumentsToNodes as vi.Mock).mockResolvedValue(mockNodes);

    const result = await transformDocumentsToNodes(mockDocuments, mockConfig, mockSettings);
    expect(result.map((n) => n.text)).toEqual(mockNodes.map((n) => n.text));
    
    // TODO: I can't get these to work. Apparently you can't spyOn a function that is imported from the same file.
    // all well and good but ... why did CoPilot generate a test that can't work?
    // expect(transformDocumentsToNodes).toHaveBeenCalledWith(filteredDocuments, expect.any(Array));
  });

  it('should exclude all metadata keys from embedding', async () => {
    const mockDocuments = [
      new Document({ text: 'Document 1', metadata: { key1: 'value1', key2: 'value2' } }),
    ];

    const nodes = await transformDocumentsToNodes(mockDocuments, mockConfig, mockSettings)
    expect(nodes[0].excludedEmbedMetadataKeys).toEqual(['key1', 'key2']);
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
    azureOpenAIKey: null,
    azureOpenAIEndpoint: null,
    azureOpenAIApiVersion: null,
    mistralApiKey: null,
    geminiApiKey: null,
  };


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