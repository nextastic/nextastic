import * as cache from '@nextastic/cache'
import { ConfigOptions, Path, PathValue } from './types'

export class Config<T extends Record<string, any>> {
  public defaultValues: T

  constructor(options: ConfigOptions<T>) {
    this.defaultValues = options.defaultValues
  }

  async get<P extends Path<T>>(prop: P): Promise<PathValue<T, P>> {
    const key = this.getKey(prop)
    const cached = await cache.get(key)
    if (cached) {
      return cached
    }

    return this.getNestedValue(this.defaultValues, prop)
  }

  async set<P extends Path<T>>(
    prop: P,
    value: PathValue<T, P>
  ): Promise<boolean> {
    const key = this.getKey(prop)
    const set = await cache.set(key, value)
    if (!set) {
      return false
    }

    this.setNestedValue(this.defaultValues, prop, value)
    return true
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.')
    const lastPart = parts.pop()!
    const target = parts.reduce((acc, part) => {
      if (!(part in acc)) acc[part] = {}
      return acc[part]
    }, obj)
    target[lastPart] = value
  }

  private getKey(prop: any): string {
    return `nxtc.cfg.${prop}`
  }
}
