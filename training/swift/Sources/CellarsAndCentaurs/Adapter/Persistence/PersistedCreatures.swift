final class PersistedCreatures: Creatures {
    private let repository: CreatureRepository

    init(repository: CreatureRepository) {
        self.repository = repository
    }

    func save(_ creature: Creature) throws {
        repository.save(CreatureMapper.toEntity(creature))
    }

    func find(_ id: CreatureId) throws -> Creature {
        guard let entity = repository.findOne(id.value) else {
            throw NoSuchCreatureException(id: id)
        }
        return CreatureMapper.toDomain(entity)
    }

    func findAll() -> [Creature] {
        repository.findAll().map(CreatureMapper.toDomain)
    }
}
