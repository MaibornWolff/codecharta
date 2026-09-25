enum CreatureMapper {
    static func toEntity(_ creature: Creature) -> CreatureEntity {
        CreatureEntity(
            id: creature.id.value,
            typeName: creature.type.rawValue,
            currentHitPoints: creature.hitPoints?.current ?? 0,
            maximumHitPoints: creature.hitPoints?.maximum ?? 0
        )
    }

    static func toDomain(_ entity: CreatureEntity) -> Creature {
        let type = CreatureType(rawValue: entity.typeName) ?? CreatureFacade.STANDARD_CREATURE_TYPE
        let creature = Creature(id: CreatureId(entity.id), type: type)
        creature.hitPoints = HitPoints(current: entity.currentHitPoints, maximum: entity.maximumHitPoints)
        return creature
    }
}
