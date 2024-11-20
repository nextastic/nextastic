import { config } from '@nextastic/config'

export async function api(path: string) {
  return (await config.get('app.url')) + `/api${path}`
}
