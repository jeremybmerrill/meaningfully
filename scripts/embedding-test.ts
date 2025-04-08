import { Document, TextNode } from 'llamaindex';
import { getEmbedModel, transformDocuments, embedDocuments } from '../src/main/services/embeddings';
import { OpenAIEmbedding  } from 'llamaindex';

// export function mockEmbeddingModel(
//     embedModel: OpenAIEmbedding,
//     embeddingsLength: number = 1,
//   ) {
//     vi.spyOn(embedModel, "getTextEmbedding").mockImplementation(async (x) => {
//       return new Promise((resolve) => {
//         resolve([1, 0, 0, 0, 0, 0]);
//       });
//     });
//     vi.spyOn(embedModel, "getTextEmbeddings").mockImplementation(async (x) => {
//       return new Promise((resolve) => {
//         if (x.length > 1) {
//           resolve(Array(x.length).fill([1, 0, 0, 0, 0, 0]));
//         }
//         resolve([[1, 0, 0, 0, 0, 0]]);
//       });
//     });
//     vi.spyOn(embedModel, "getQueryEmbedding").mockImplementation(async (x) => {
//       return new Promise((resolve) => {
//         resolve([0, 1, 0, 0, 0, 0]);
//       });
//     });
//   }

// describe('embedDocuments', () => {
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

//   it('should process documents and return nodes', async () => {
    const mockDocuments = [
      new Document({ text: 'Document 1', metadata: { key1: 'value1' } }),
      new Document({ text: 'Document 2', metadata: { key2: 'value2' } }),
    ];
    const mockNodes = [
      new TextNode({ text: 'Document 1' }),
      new TextNode({ text: 'Document 2' }),
    ];

    // (getEmbedModel as vi.Mock).mockReturnValue(mockEmbeddingModel);
    // (transformDocuments as vi.Mock).mockResolvedValue(mockNodes);

    const result = await embedDocuments(mockDocuments, mockConfig, mockSettings);
    console.log(result)
    // expect(result).toEqual(mockNodes);
    // expect(getEmbedModel).toHaveBeenCalledWith(mockConfig, mockSettings);
    // expect(transformDocuments).toHaveBeenCalledWith(mockDocuments, expect.any(Array));
//   });

//   it('should filter out documents with null, undefined, or zero-length text', async () => {
//     const mockDocuments = [
//       new Document({ text: 'Valid Document', metadata: { key1: 'value1' } }),
//       new Document({ text: undefined, metadata: { key3: 'value3' } }),
//       new Document({ text: '', metadata: { key4: 'value4' } }),
//     ];
//     const filteredDocuments = [mockDocuments[0]];
//     const mockNodes = [new TextNode({ text: 'Valid Document' })];

//     (getEmbedModel as vi.Mock).mockReturnValue(mockEmbeddingModel);
//     (transformDocuments as vi.Mock).mockResolvedValue(mockNodes);

//     const result = await embedDocuments(mockDocuments, mockConfig, mockSettings);

//     expect(result).toEqual(mockNodes);
//     expect(transformDocuments).toHaveBeenCalledWith(filteredDocuments, expect.any(Array));
//   });

//   it('should exclude all metadata keys from embedding', async () => {
//     const mockDocuments = [
//       new Document({ text: 'Document 1', metadata: { key1: 'value1', key2: 'value2' } }),
//     ];
// //    const mockNodes = [new TextNode({ text: 'Document 1' })];

//     (getEmbedModel as vi.Mock).mockReturnValue(mockEmbeddingModel);
// //    (transformDocuments as vi.Mock).mockResolvedValue(mockNodes);

//     await embedDocuments(mockDocuments, mockConfig, mockSettings);

//     expect(mockDocuments[0].excludedEmbedMetadataKeys).toEqual(['key1', 'key2']);
//   });
// });