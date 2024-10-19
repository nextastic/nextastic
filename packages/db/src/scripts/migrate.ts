import { Client } from 'pg'
import { getConnectionStringFromEnv } from 'pg-connection-from-env'
import nodePgMigrate from 'node-pg-migrate'
import { join } from 'node:path'
import process from 'node:process'

const database = process.env.POSTGRES_DB

export async function migrate(directory?: string) {
  const dir =
    directory ?? join(__dirname, '../../../../src/database/migrations')
  const client = new Client(
    getConnectionStringFromEnv({
      fallbackDefaults: {
        database,
      },
    })
  )
  await client.connect()

  await nodePgMigrate({
    dbClient: client,
    direction: 'up',
    schema: 'public',
    createSchema: true,
    createMigrationsSchema: true,
    migrationsSchema: 'migrations',
    migrationsTable: 'pgmigrations',
    verbose: false,
    dir,
  })

  // eslint-disable-next-line no-console
  console.log('Running migrations...')

  await client.end()

  // eslint-disable-next-line no-console
  console.log('Migrations completed')
}
