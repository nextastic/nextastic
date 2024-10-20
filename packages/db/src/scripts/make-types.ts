import { getConnectionStringFromEnv } from 'pg-connection-from-env'
import * as zg from 'zapatos/generate'
import process from 'node:process'

const database = process.env.POSTGRES_DB

export async function makeTypes(schemas: string[]) {
  await zg.generate({
    db: {
      connectionString: getConnectionStringFromEnv({
        fallbackDefaults: {
          database,
        },
      }),
    },
    schemas: Object.fromEntries(
      schemas.map((s: string) => [
        s,
        {
          include: '*',
          exclude: [],
        },
      ])
    ),
    outDir: 'src/database/schema',
  })
}
