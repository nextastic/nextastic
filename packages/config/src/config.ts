import * as cache from '@nextastic/cache'

interface ConfigOptions<T> {
  name: string
  defaultValues: T
}

export class Config<T extends Record<string, any>> {
  private name: string
  private defaultValues: T

  constructor(options: ConfigOptions<T>) {
    this.name = options.name
    this.defaultValues = options.defaultValues
  }

  async get<K extends keyof T>(prop: K): Promise<T[K]> {
    const key = this.getKey(prop)
    const cached = await cache.get(key)
    if (cached) {
      return cached
    }

    return this.defaultValues[prop]
  }

  async set(prop: keyof T, value: T[keyof T]): Promise<boolean> {
    const key = this.getKey(prop)
    const set = cache.set(key, value)
    if (!set) {
      return false
    }

    this.defaultValues[prop] = value
    return true
  }

  private getKey(prop: keyof T): string {
    return `nextastic.${this.name}.${String(prop)}`
  }
}
