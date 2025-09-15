import { MetadataManager } from '@meaningfully/core';
import Database from 'better-sqlite3';
import { type Database as SqliteDatabase } from 'better-sqlite3';
import { join } from 'path';


export class SqliteMetadataManager extends MetadataManager {
  private sqliteDb: SqliteDatabase;

  constructor(storagePath: string) {
    super();
    this.sqliteDb = new Database(join(storagePath, 'metadata.db'));
    this.initializeDatabase();
  }

  protected async initializeDatabase(): Promise<void> {
    this.sqliteDb.exec(this.queries.createDocumentSetsTable);
    this.sqliteDb.exec(this.queries.createSettingsTable);
  }

  protected async runQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    const stmt = this.sqliteDb.prepare(query.replaceAll(/\$[0-9]+/g, '?'));
    if (params.length > 0) {
      return stmt.all(...params) as T[];
    } else {
      return stmt.all() as T[];
    }
  }

  protected async runQuerySingle<T>(query: string, params: any[] = []): Promise<T | null> {
    const stmt = this.sqliteDb.prepare(query.replaceAll(/\$[0-9]+/g, '?'));
    if (params.length > 0) {
      return stmt.get(...params) as T | null;
    } else {
      return stmt.get() as T | null;
    }
  }

  protected close(): void {
    this.sqliteDb.close();
  }
}