import * as cache from '@nextastic/cache'

interface ConfigOptions<T> {
  name: string
  defaultValues: T
}

// Add utility types for dot notation
type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? never
      : `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never

type Path<T> = PathImpl<T, keyof T>

// Get the type of a nested property
type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never

export class Config<T extends Record<string, any>> {
  private name: string
  private defaultValues: T

  constructor(options: ConfigOptions<T>) {
    this.name = options.name
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

  private getKey(prop: Path<any>): string {
    return `nextastic.${this.name}.${prop}`
  }
}
