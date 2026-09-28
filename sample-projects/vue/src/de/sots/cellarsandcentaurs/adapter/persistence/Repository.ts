export abstract class Repository<T extends { id: string }> {
  private readonly items: Map<string, T> = new Map()

  save(item: T): Promise<void> {
    this.items.set(item.id, item)
    return Promise.resolve()
  }

  findOne(id: string): Promise<T | undefined> {
    return Promise.resolve(this.items.get(id))
  }

  findAll(): Promise<T[]> {
    return Promise.resolve(Array.from(this.items.values()))
  }
}
