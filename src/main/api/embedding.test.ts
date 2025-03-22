import { describe, it, expect, vi } from 'vitest';
import { createEmbeddings, previewResults, getDocStore, getIndex, search } from './embedding';
import { loadDocumentsFromCsv } from '../services/csvLoader';
import { embedDocuments, createPreviewNodes, estimateCost, searchDocuments, getExistingVectorStoreIndex, persistNodes, getExistingDocStore } from '../services/embeddings';
import { MetadataMode } from 'llamaindex';

// filepath: /Users/jeremybmerrill/code/meaningfully/src/main/api/embedding.test.ts


vi.mock('../services/csvLoader');
vi.mock('../services/embeddings');

describe('embedding.ts', () => {
    describe('createEmbeddings', () => {
        it('should create embeddings and return success', async () => {
            const mockDocuments = [{ text: 'doc1' }, { text: 'doc2' }];
            const mockNodes = [{ node: 'node1' }, { node: 'node2' }];
            const mockIndex = 'index1';
            loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
            embedDocuments.mockResolvedValue(mockNodes);
            persistNodes.mockResolvedValue(mockIndex);

            const result = await createEmbeddings('path/to/csv', 'text', {}, {});

            expect(result).toEqual({ success: true, index: mockIndex });
        });

        it('should return error on failure', async () => {
            loadDocumentsFromCsv.mockRejectedValue(new Error('Failed to load documents'));

            const result = await createEmbeddings('path/to/csv', 'text', {}, {});

            expect(result).toEqual({ success: false, error: 'Failed to load documents' });
        });

        it('should handle empty documents', async () => {
            loadDocumentsFromCsv.mockResolvedValue([]);

            const result = await createEmbeddings('path/to/csv', 'text', {}, {});

            expect(result).toEqual({ success: false, error: 'That CSV does not appear to contain any documents. Please check the file and try again.' });
        });
    });

    describe('previewResults', () => {
        it('should return preview results and estimated cost', async () => {
            const mockDocuments = Array(20).fill({ text: 'doc' });
            const mockNodes = [{ text: 'node1', metadata: {} }, { text: 'node2', metadata: {} }];
            const mockPreviewNodes = [{ text: 'node1', metadata: {} }, { text: 'node2', metadata: {} }];
            const mockEstimate = { estimatedPrice: 10, tokenCount: 100 };
            loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
            createPreviewNodes.mockResolvedValue(mockNodes);
            estimateCost.mockReturnValue(mockEstimate);

            const result = await previewResults('path/to/csv', 'text', {});

            expect(result).toEqual({
                success: true,
                nodes: mockPreviewNodes,
                estimatedPrice: 10,
                tokenCount: 100
            });
        });

        it('should return error on failure', async () => {
            loadDocumentsFromCsv.mockRejectedValue(new Error('Failed to load documents'));

            const result = await previewResults('path/to/csv', 'text', {});

            expect(result).toEqual({ success: false, error: 'Failed to load documents' });
        });

        it('should handle empty documents', async () => {
            loadDocumentsFromCsv.mockResolvedValue([]);

            const result = await previewResults('path/to/csv', 'text', {});

            expect(result).toEqual({ success: false, error: 'That CSV does not appear to contain any documents. Please check the file and try again.' });
        });
    });

    describe('getDocStore', () => {
        it('should return existing doc store', async () => {
            const mockDocStore = 'docStore';
            getExistingDocStore.mockResolvedValue(mockDocStore);

            const result = await getDocStore({});

            expect(result).toBe(mockDocStore);
        });
    });

    describe('getIndex', () => {
        it('should return existing vector store index', async () => {
            const mockIndex = 'index';
            getExistingVectorStoreIndex.mockResolvedValue(mockIndex);

            const result = await getIndex({}, {});

            expect(result).toBe(mockIndex);
        });
    });

    describe('search', () => {
        it('should return search results', async () => {
            const mockResults = [
                { node: { getContent: () => 'content1', metadata: {} }, score: 1 },
                { node: { getContent: () => 'content2', metadata: {} }, score: 2 }
            ];
            searchDocuments.mockResolvedValue(mockResults);

            const result = await search('index', 'query');

            expect(result).toEqual([
                { text: 'content1', score: 1, metadata: {} },
                { text: 'content2', score: 2, metadata: {} }
            ]);
        });

        it('should handle no search results', async () => {
            searchDocuments.mockResolvedValue([]);

            const result = await search('index', 'query');

            expect(result).toEqual([]);
        });

        it('should handle search results with null scores', async () => {
            const mockResults = [
                { node: { getContent: () => 'content1', metadata: {} }, score: null },
                { node: { getContent: () => 'content2', metadata: {} }, score: null }
            ];
            searchDocuments.mockResolvedValue(mockResults);

            const result = await search('index', 'query');

            expect(result).toEqual([
                { text: 'content1', score: 0, metadata: {} },
                { text: 'content2', score: 0, metadata: {} }
            ]);
        });
    });
});

  describe('previewResults', () => {
    it('should return preview results and estimated cost', async () => {
      const mockDocuments = Array(20).fill({ text: 'doc' });
      const mockNodes = [{ text: 'node1', metadata: {} }, { text: 'node2', metadata: {} }];
      const mockPreviewNodes = [{ text: 'node1', metadata: {} }, { text: 'node2', metadata: {} }];
      const mockEstimate = { estimatedPrice: 10, tokenCount: 100 };
      loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
      createPreviewNodes.mockResolvedValue(mockNodes);
      estimateCost.mockReturnValue(mockEstimate);

      const result = await previewResults('path/to/csv', 'text', {});

      expect(result).toEqual({
        success: true,
        nodes: mockPreviewNodes,
        estimatedPrice: 10,
        tokenCount: 100
      });
    });

    it('should return error on failure', async () => {
      loadDocumentsFromCsv.mockRejectedValue(new Error('Failed to load documents'));

      const result = await previewResults('path/to/csv', 'text', {});

      expect(result).toEqual({ success: false, error: 'Failed to load documents' });
    });
  });

  describe('getDocStore', () => {
    it('should return existing doc store', async () => {
      const mockDocStore = 'docStore';
      getExistingDocStore.mockResolvedValue(mockDocStore);

      const result = await getDocStore({});

      expect(result).toBe(mockDocStore);
    });
  });

  describe('getIndex', () => {
    it('should return existing vector store index', async () => {
      const mockIndex = 'index';
      getExistingVectorStoreIndex.mockResolvedValue(mockIndex);

      const result = await getIndex({}, {});

      expect(result).toBe(mockIndex);
    });
  });
    describe('search', () => {
        it('should return search results', async () => {
        const mockResults = [
            { node: { getContent: () => 'content1', metadata: {} }, score: 1 },
            { node: { getContent: () => 'content2', metadata: {} }, score: 2 }
        ];
        searchDocuments.mockResolvedValue(mockResults);
    
        const result = await search('index', 'query');
    
        expect(result).toEqual([
            { text: 'content1', score: 1, metadata: {} },
            { text: 'content2', score: 2, metadata: {} }
        ]);
        });
    
        it('should handle no search results', async () => {
        searchDocuments.mockResolvedValue([]);
    
        const result = await search('index', 'query');
    
        expect(result).toEqual([]);
        });
    
        it('should handle search results with null scores', async () => {
        const mockResults = [
            { node: { getContent: () => 'content1', metadata: {} }, score: null },
            { node: { getContent: () => 'content2', metadata: {} }, score: null }
        ];
        searchDocuments.mockResolvedValue(mockResults);
    
        const result = await search('index', 'query');
    
        expect(result).toEqual([
            { text: 'content1', score: 0, metadata: {} },
            { text: 'content2', score: 0, metadata: {} }
        ]);
        });
    });