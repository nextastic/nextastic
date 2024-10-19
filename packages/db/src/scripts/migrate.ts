import { Client } from 'pg'
import { getConnectionStringFromEnv } from 'pg-connection-from-env'
import nodePgMigrate from 'node-pg-migrate'
import { join, dirname } from 'node:path'
import process from 'node:process'

const migrationDir = join(__dirname, '../migrations')

const database = process.env.POSTGRES_DB

export async function migrate() {
  const fullPath = dirname(require.main?.filename ?? '')
  console.log('path: ', fullPath)
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
    dir: migrationDir,
  })

  // eslint-disable-next-line no-console
  console.log('Running migrations...')

  await client.end()

  // eslint-disable-next-line no-console
  console.log('Migrations completed')
}
