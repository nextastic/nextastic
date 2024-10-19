/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(
    {
      schema: 'myapp',
      name: 'users',
    },
    {
      id: 'id',
      created_at: 'timestamp',
      updated_at: 'timestamp',
      email: { type: 'text', notNull: true },
    }
  )

  pgm.createTrigger(
    {
      schema: 'myapp',
      name: 'users',
    },
    `users_updated`,
    {
      when: 'BEFORE',
      level: 'ROW',
      operation: 'UPDATE',
      function: 'update_updated_at_column',
    }
  )
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
