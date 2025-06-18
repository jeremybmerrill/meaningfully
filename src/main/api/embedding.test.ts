//@ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEmbeddings, previewResults, getDocStore, getIndex, search } from './embedding';
import { loadDocumentsFromCsv } from '../services/csvLoader';
import { transformDocumentsToNodes, estimateCost, searchDocuments, getExistingVectorStoreIndex, persistNodes, getExistingDocStore } from '../services/embeddings';
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
            transformDocumentsToNodes.mockResolvedValue(mockNodes);
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
            const mockEstimate = { estimatedPrice: 10, tokenCount: 100, pricePer1M: 0.01 };
            loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
            transformDocumentsToNodes.mockResolvedValue(mockNodes);
            estimateCost.mockReturnValue(mockEstimate);

            const result = await previewResults('path/to/csv', 'text', {});

            expect(result).toEqual({
                success: true,
                nodes: mockPreviewNodes,
                ...mockEstimate
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
      const mockEstimate = { estimatedPrice: 10, tokenCount: 100, pricePer1M: 0.01 };
      loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
      transformDocumentsToNodes.mockResolvedValue(mockNodes);
      estimateCost.mockReturnValue(mockEstimate);

      const result = await previewResults('path/to/csv', 'text', {});

      expect(result).toEqual({
        success: true,
        nodes: mockPreviewNodes,
        ...mockEstimate
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
    describe('createEmbeddings with progress tracking', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it('should pass progress callback to persistNodes', async () => {
        // Setup mocks
        const mockDocuments = [{ text: 'doc1' }, { text: 'doc2' }];
        const mockNodes = [{ text: 'node1', metadata: {} }, { text: 'node2', metadata: {} }];
        const mockIndex = 'index1';
        loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
        transformDocumentsToNodes.mockResolvedValue(mockNodes);
        persistNodes.mockImplementation((nodes, config, settings, clients, callback) => {
          // Call the callback with sample progress
          if (callback) {
            callback(1, 2);  // 50% progress
            callback(2, 2);  // 100% progress
          }
          return Promise.resolve(mockIndex);
        });

        // Execute
        const result = await createEmbeddings('path/to/csv', 'text', { modelName: 'test-model' }, {}, {});

        // Verify
        expect(persistNodes).toHaveBeenCalledTimes(1);
        expect(persistNodes.mock.calls[0][4]).toBeInstanceOf(Function); // Verify callback was passed
        expect(result).toEqual({ success: true, index: mockIndex });
      });

      it('should correctly track progress through ProgressManager', async () => {
        // Setup
        vi.mock('../services/progressManager', () => {
          const mockInstance = {
            startOperation: vi.fn(),
            updateProgress: vi.fn(),
            completeOperation: vi.fn(),
            clearOperation: vi.fn()
          };
          
          return {
            ProgressManager: {
              getInstance: () => mockInstance
            }
          };
        });
        
        // Re-import to use mocked version
        const { createEmbeddings } = await import('./embedding');
        const { ProgressManager } = await import('../services/progressManager');
        
        const mockDocuments = [{ text: 'doc1' }, { text: 'doc2' }];
        const mockNodes = [{ text: 'node1', metadata: {} }];
        const mockIndex = 'testIndex';
        
        loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
        transformDocumentsToNodes.mockResolvedValue(mockNodes);
        persistNodes.mockImplementation((nodes, config, settings, clients, callback) => {
          if (callback) callback(1, 2); // Call with 50% progress
          return Promise.resolve(mockIndex);
        });
        
        // Execute
        await createEmbeddings('path/to/csv', 'text', {}, {}, {});
        
        // Verify
        const progressManager = ProgressManager.getInstance();
        expect(progressManager.startOperation).toHaveBeenCalledWith(expect.stringMatching(/^embed-\d+$/), 100);
        expect(progressManager.updateProgress).toHaveBeenCalledWith(expect.any(String), 5);
        expect(progressManager.updateProgress).toHaveBeenCalledWith(expect.any(String), expect.any(Number));
        expect(progressManager.completeOperation).toHaveBeenCalledWith(expect.any(String));
      });

      it('should properly calculate percentage in progress callback', async () => {
        // Setup mocks with spy on updateProgress
        vi.mock('../services/progressManager', () => {
          const mockInstance = {
            startOperation: vi.fn(),
            updateProgress: vi.fn(),
            completeOperation: vi.fn(),
            clearOperation: vi.fn()
          };
          
          return {
            ProgressManager: {
              getInstance: () => mockInstance
            }
          };
        });
        
        // Re-import to use mocked version
        const { createEmbeddings } = await import('./embedding');
        const { ProgressManager } = await import('../services/progressManager');

        const mockDocuments = [{ text: 'doc1' }];
        const mockNodes = [{ text: 'node1', metadata: {} }];
        loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
        transformDocumentsToNodes.mockResolvedValue(mockNodes);
        
        // Simulate persistNodes calling the callback with various progress values
        persistNodes.mockImplementation((nodes, config, settings, clients, callback) => {
          if (callback) {
            callback(0, 10);  // 0% progress
            callback(5, 10);  // 50% progress
            callback(10, 10); // 100% progress
          }
          return Promise.resolve('mockIndex');
        });
        
        // Execute
        await createEmbeddings('path/to/csv', 'text', {}, {}, {});
        
        // Verify percentage calculations
        // Initial update at 5%
        const progressManager = ProgressManager.getInstance();
        expect(progressManager.updateProgress).toHaveBeenCalledWith(expect.any(String), 5);
        
        // Progress updates: 0%, 50%, 100% mapped to 5-95% range
        expect(progressManager.updateProgress).toHaveBeenCalledWith(expect.any(String), 5);   // 0% -> 5%
        expect(progressManager.updateProgress).toHaveBeenCalledWith(expect.any(String), 50);  // 50% -> 50%
        expect(progressManager.updateProgress).toHaveBeenCalledWith(expect.any(String), 95);  // 100% -> 95%
      });

      it('should clear operation on empty documents', async () => {
        // Setup
        vi.mock('../services/progressManager', () => {
          const mockInstance = {
            startOperation: vi.fn(),
            updateProgress: vi.fn(),
            completeOperation: vi.fn(),
            clearOperation: vi.fn()
          };
          
          return {
            ProgressManager: {
              getInstance: () => mockInstance
            }
          };
        });
        
        // Re-import to use mocked version
        const { createEmbeddings } = await import('./embedding');
        const { ProgressManager } = await import('../services/progressManager');

        loadDocumentsFromCsv.mockResolvedValue([]);
        
        // Execute
        const result = await createEmbeddings('path/to/csv', 'text', {}, {}, {});
        
        // Verify
        const progressManager = ProgressManager.getInstance();
        expect(progressManager.clearOperation).toHaveBeenCalled();
        expect(result).toEqual({
          success: false, 
          error: "That CSV does not appear to contain any documents. Please check the file and try again."
        });
      });

      it('shoulde complete operation on successful embedding', async () => {
        // Setup
        vi.mock('../services/progressManager', () => {
          const mockInstance = {
            startOperation: vi.fn(),
            updateProgress: vi.fn(),
            completeOperation: vi.fn(),
            clearOperation: vi.fn()
          };
          
          return {
            ProgressManager: {
              getInstance: () => mockInstance
            }
          };
        });
        
        // Re-import to use mocked version
        const { createEmbeddings } = await import('./embedding');
        const { ProgressManager } = await import('../services/progressManager');

        const mockDocuments = [{ text: 'doc1' }];
        const mockNodes = [{ text: 'node1', metadata: {} }];
        loadDocumentsFromCsv.mockResolvedValue(mockDocuments);
        transformDocumentsToNodes.mockResolvedValue(mockNodes);
        persistNodes.mockResolvedValue('mockIndex');
        
        // Execute
        await createEmbeddings('path/to/csv', 'text', {}, {}, {});
        
        // Verify
        const progressManager = ProgressManager.getInstance();
        expect(progressManager.completeOperation).toHaveBeenCalled();
      });
    });