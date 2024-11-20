import { Kysely } from 'kysely'
import { KyselyDatabaseInstance } from './schema/types.js'
import { PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { getConnectionStringFromEnv } from 'pg-connection-from-env'
import { config } from '@nextastic/config'

export async function connectDb(): Promise<KyselyDatabaseInstance> {
  return new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: getConnectionStringFromEnv({
          fallbackDefaults: {
            database: await config.get('db.POSTGRES_DB'),
          },
        }),
      }),
    }),
  })
}
