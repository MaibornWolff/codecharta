/**
 * @template T
 */
export class Repository {
    constructor() {
        /** @type {Map<string, T>} */
        this.items = new Map();
    }

    /**
     * @param {T} item
     */
    async save(item) {
        this.items.set(item.id, item);
    }

    /**
     * @returns {T | undefined}
     */
    findOne(id) {
        return this.items.get(id);
    }

    /**
     * @returns {T[]}
     */
    findAll() {
        return Array.from(this.items.values());
    }
}
