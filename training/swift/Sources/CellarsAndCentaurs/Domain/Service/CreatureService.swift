final class CreatureService {
    private let creatures: Creatures

    init(creatures: Creatures) {
        self.creatures = creatures
    }

    func save(_ creature: Creature) throws {
        try creatures.save(creature)
    }

    func find(_ id: CreatureId) throws -> Creature {
        try creatures.find(id)
    }
}
