import { MetadataManager } from '@meaningfully/core';
import knex, { Knex } from 'knex';
import { join } from 'path';

export class SqliteMetadataManager extends MetadataManager {
  protected knex: Knex;

  constructor(storagePath: string) {
    super();
    this.knex = knex({
      client: 'better-sqlite3',
      connection: {
        filename: join(storagePath, 'metadata.db')
      },
      useNullAsDefault: true
    });
    this.initializeDatabase();
  }

  protected async initializeDatabase(): Promise<void> {
    const hasDocumentSetsTable = await this.knex.schema.hasTable('document_sets');
    if (!hasDocumentSetsTable) {
      await this.knex.schema.createTable('document_sets', (table) => {
        table.increments('set_id').primary();
        table.text('name').notNullable().unique();
        table.timestamp('upload_date').notNullable();
        table.text('parameters').notNullable();
        table.integer('total_documents').notNullable().defaultTo(0);
      });
    }

    const hasSettingsTable = await this.knex.schema.hasTable('meaningfully_settings');
    if (!hasSettingsTable) {
      await this.knex.schema.createTable('meaningfully_settings', (table) => {
        table.increments('settings_id').primary();
        table.text('settings').notNullable();
      });
    }
  }

  protected close(): void {
    this.knex.destroy();
  }
}