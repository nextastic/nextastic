import crypto from 'node:crypto'

export function generateUuid() {
  return crypto.randomUUID()
}
