/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions, PgLiteral } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = {
  timestamp: {
    type: 'timestamptz',
    notNull: true,
    default: PgLiteral.create('current_timestamp'),
  },
}

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createSchema('testapp', { ifNotExists: true })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropSchema('testapp')
}
