protocol Creatures {
    func save(_ creature: Creature) throws
    func find(_ id: CreatureId) throws -> Creature
    func findAll() -> [Creature]
}
