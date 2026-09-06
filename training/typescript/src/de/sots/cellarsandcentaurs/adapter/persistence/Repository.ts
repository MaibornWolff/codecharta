export abstract class Repository<T extends { id: string }> {
    private readonly items: Map<string, T> = new Map();

    protected abstract tableName(): string;

    async save(item: T): Promise<void> {
        this.items.set(item.id, item);
    }

    findOne(id: string): T | undefined {
        return this.items.get(id);
    }

    findAll(): T[] {
        return Array.from(this.items.values());
    }
}
