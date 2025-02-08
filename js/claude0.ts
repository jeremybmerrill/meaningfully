import { ChromaClient, Collection } from 'chromadb';
import Database from 'better-sqlite3';
import { z } from 'zod';

// Define types for our document set metadata
interface DocumentSetMetadata {
  setId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}

// Schema validation for document metadata
const DocumentMetadataSchema = z.object({
  docId: z.string(),
  contentType: z.string(),
  pageNum: z.number().optional(),
  setId: z.number()  // Reference to the document set
});

type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export class DocumentManager {
  private chromaClient: ChromaClient;
  private collection: Collection;
  private sqliteDb: Database;

  constructor() {
    // Initialize ChromaDB client
    this.chromaClient = new ChromaClient();
    
    // Initialize SQLite database for document set metadata
    this.sqliteDb = new Database('metadata.db');
    
    // Initialize the collection
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Create ChromaDB collection
    this.collection = await this.chromaClient.createCollection({
      name: "documents",
      metadata: { description: "Document storage with metadata" }
    });

    // Create SQLite table for document sets
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS document_sets (
        set_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        parameters TEXT NOT NULL,
        total_documents INTEGER NOT NULL DEFAULT 0
      )
    `);
  }

  async addDocumentSet(metadata: Omit<DocumentSetMetadata, 'setId'>): Promise<number> {
    const stmt = this.sqliteDb.prepare(`
      INSERT INTO document_sets (name, upload_date, parameters, total_documents)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      metadata.name,
      metadata.uploadDate.toISOString(),
      JSON.stringify(metadata.parameters),
      metadata.totalDocuments
    );

    return result.lastInsertRowid as number;
  }

  async addDocument(
    documentText: string,
    metadata: DocumentMetadata,
    embedding: number[]
  ): Promise<void> {
    // Validate metadata
    DocumentMetadataSchema.parse(metadata);

    // Add document to ChromaDB
    await this.collection.add({
      ids: [metadata.docId],
      embeddings: embedding,
      metadatas: [metadata],
      documents: [documentText]
    });

    // Update document count in SQLite
    const stmt = this.sqliteDb.prepare(`
      UPDATE document_sets 
      SET total_documents = total_documents + 1
      WHERE set_id = ?
    `);
    stmt.run(metadata.setId);
  }

  async getDocumentSet(setId: number): Promise<DocumentSetMetadata | null> {
    const stmt = this.sqliteDb.prepare(`
      SELECT * FROM document_sets WHERE set_id = ?
    `);
    
    const row = stmt.get(setId);
    if (!row) return null;

    return {
      setId: row.set_id,
      name: row.name,
      uploadDate: new Date(row.upload_date),
      parameters: JSON.parse(row.parameters),
      totalDocuments: row.total_documents
    };
  }

  async queryDocuments(
    queryEmbedding: number[],
    setId?: number,
    limit: number = 10
  ) {
    const filter = setId ? { setId } : undefined;
    
    return await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      whereDocument: filter
    });
  }

  close() {
    this.sqliteDb.close();
  }
}