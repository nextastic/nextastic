import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(
    {
      schema: 'testapp',
      name: 'users',
    },
    {
      id: 'id',
      created_at: 'timestamp',
      updated_at: 'timestamp',
      email: { type: 'text', notNull: true },
    }
  )
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
