class Repository<T: Identifiable> where T.ID == String {
    private var storage: [String: T] = [:]

    func save(_ item: T) {
        storage[item.id] = item
    }

    func findOne(_ id: String) -> T? {
        storage[id]
    }

    func findAll() -> [T] {
        Array(storage.values)
    }
}
