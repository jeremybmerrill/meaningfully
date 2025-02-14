import Database from 'better-sqlite3';
import type { DocumentSetMetadata } from './types';
import { join } from 'path';
export class DocumentSetManager {
  private sqliteDb: Database;

  constructor(storagePath: string) {
    // Initialize SQLite database for document set metadata
    this.sqliteDb = new Database(join(storagePath, 'metadata.db'));
    
    // Initialize the collection
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Create SQLite table for document sets
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS document_sets (
        set_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
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

  async getDocumentSet(setId: number): Promise<DocumentSetMetadata | null> {
    console.log("getDocumentSet arg", setId);
    const stmt = this.sqliteDb.prepare(`
      SELECT * FROM document_sets WHERE set_id = ?
    `);
    
    const row = stmt.get(setId);
    console.log("getDocumentSet return", row);
    if (!row) return null;

    return {
      setId: row.set_id,
      name: row.name,
      uploadDate: new Date(row.upload_date),
      parameters: JSON.parse(row.parameters),
      totalDocuments: row.total_documents
    };
  }

  async getDocumentSets(): Promise<DocumentSetMetadata[]> {
    const stmt = this.sqliteDb.prepare(`
        SELECT * FROM document_sets ORDER BY uploadDate DESC LIMIT ?
      `);
    const rows = stmt.all(10);

    return rows.map(row => ({
        setId: row.set_id,
        name: row.name,
        uploadDate: new Date(row.upload_date),
        parameters: JSON.parse(row.parameters),
        totalDocuments: row.total_documents
    }))
  }

  async updateDocumentCount(setId: number, count: number) {
    const stmt = this.sqliteDb.prepare(`
      UPDATE document_sets 
      SET total_documents = total_documents + ?
      WHERE set_id = ?
    `);
    
    stmt.run(count, setId);
  }

  async deleteDocumentSet(setId: number) {
    const stmt = this.sqliteDb.prepare(`
      DELETE FROM document_sets
      WHERE set_id = ?
    `);
    
    stmt.run(setId);
  }

  close() {
    this.sqliteDb.close();
  }
}