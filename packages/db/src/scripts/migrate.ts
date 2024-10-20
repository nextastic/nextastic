import pg from 'pg'
import { getConnectionStringFromEnv } from 'pg-connection-from-env'
import nodePgMigrate from 'node-pg-migrate'
import { join } from 'node:path'
import process from 'node:process'
import * as childProcess from 'node:child_process'

const { Client } = pg

const database = process.env.POSTGRES_DB

export async function migrate(directory?: string) {
  const dir =
    directory ??
    join(require.main?.path ?? '', '../../../../src/database/migrations')
  const client = new Client(
    getConnectionStringFromEnv({
      fallbackDefaults: {
        database,
      },
    })
  )
  await client.connect()

  const dbString = getConnectionStringFromEnv({
    fallbackDefaults: {
      database,
    },
  })

  const args = ['-j', 'ts', '-m', `"${dir}"`]

  childProcess.execSync(
    `DATABASE_URL=${dbString} npx ts-node --project node_modules/@nextastic/db/tsconfig.migrations.json node_modules/node-pg-migrate/bin/node-pg-migrate ${args.join(
      ' '
    )} up`
  )

  // eslint-disable-next-line no-console
  console.log('Running migrations...')

  await client.end()

  // eslint-disable-next-line no-console
  console.log('Migrations completed')
}
