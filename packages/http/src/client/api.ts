import { config } from '@nextastic/config'

export function api(path: string) {
  return config.app.url + `/api${path}`
}
