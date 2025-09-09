//@ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { loadDocumentsFromCsv } from './csvLoader';
import { Document } from 'llamaindex';
import Papa from 'papaparse';


vi.mock('fs');
vi.mock('papaparse');

describe('csvLoader.ts', () => {
  describe('loadDocumentsFromCsv', () => {
    it('should load documents from CSV and return Document instances', async () => {
      const mockFileContent = 'text,metadata1,metadata2\ncontent1,meta1,meta2\ncontent2,meta3,meta4';
      const mockParsedData = {
        data: [
          { text: 'content1', metadata1: 'meta1', metadata2: 'meta2' },
          { text: 'content2', metadata1: 'meta3', metadata2: 'meta4' }
        ]
      };
      readFileSync.mockReturnValue(mockFileContent);
      Papa.parse.mockReturnValue(mockParsedData);

      const result = await loadDocumentsFromCsv('path/to/csv', 'text');

      expect(remove_id(result)).toEqual(remove_id([
        new Document({ text: 'content1', metadata: { metadata1: 'meta1', metadata2: 'meta2' } }),
        new Document({ text: 'content2', metadata: { metadata1: 'meta3', metadata2: 'meta4' } })
      ]));
    });

    it('should handle empty CSV file', async () => {
      const mockFileContent = '';
      const mockParsedData = { data: [] };
      readFileSync.mockReturnValue(mockFileContent);
      Papa.parse.mockReturnValue(mockParsedData);

      const result = await loadDocumentsFromCsv('path/to/csv', 'text');

      expect(result).toEqual([]);
    });

    it('should handle missing text column', async () => {
      const mockFileContent = 'metadata1,metadata2\nmeta1,meta2\nmeta3,meta4';
      const mockParsedData = {
        data: [
          { metadata1: 'meta1', metadata2: 'meta2' },
          { metadata1: 'meta3', metadata2: 'meta4' }
        ]
      };
      readFileSync.mockReturnValue(mockFileContent);
      Papa.parse.mockReturnValue(mockParsedData);

      const result = await loadDocumentsFromCsv('path/to/csv', 'text');

      expect(remove_id(result)).toEqual(remove_id([
        new Document({ text: undefined, metadata: { metadata1: 'meta1', metadata2: 'meta2' } }),
        new Document({ text: undefined, metadata: { metadata1: 'meta3', metadata2: 'meta4' } })
      ]));
    });

    it('should handle null values in metadata', async () => {
        const mockFileContent = 'text,metadata1,metadata2\ncontent1,,meta2\ncontent2,meta3,';
        const mockParsedData = {
            data: [
            { text: 'content1', metadata1: null, metadata2: 'meta2' },
            { text: 'content2', metadata1: 'meta3', metadata2: null }
            ]
        };
        readFileSync.mockReturnValue(mockFileContent);
        Papa.parse.mockReturnValue(mockParsedData);
    
        const result = await loadDocumentsFromCsv('path/to/csv', 'text');
        expect(remove_id(result)).toEqual(remove_id([
            new Document({ text: 'content1', metadata: { metadata1: '', metadata2: 'meta2' } }),
            new Document({ text: 'content2', metadata: { metadata1: 'meta3', metadata2: '' } })
        ]));
        });
    });
});

function remove_id(list_of_documents): Document[] {
  return list_of_documents.map((doc) => {
    const { id_, ...doc_without_id } = doc;
    return doc_without_id;
});
}