import Foundation

final class CreatureFacade {
    static let STANDARD_CREATURE_TYPE: CreatureType = .monstrosity
    static let STABLE_NAME = "centaur-stable"

    private let creatureService: CreatureService

    init(creatureService: CreatureService) {
        self.creatureService = creatureService
    }

    @discardableResult
    func create(_ request: DTO.Creature) throws -> Creature {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        let creature = Creature(id: CreatureId.random(), type: request.type)
        creature.armorClass = ArmorClass(base: request.armorClassBase, bonus: request.armorClassBonus)
        creature.hitPoints = HitPoints.full(request.hitPoints)
        creature.speeds = speeds(of: request)
        try creatureService.save(creature)
        return creature
    }

    private func speeds(of request: DTO.Creature) -> [SpeedType: Speed] {
        let walkingSpeed: CellarsAndCentaurs.Speed = Speed(request.walkingSpeed)
        return [
            .walking: walkingSpeed,
            .flying: Speed(request.flyingSpeed),
            .swimming: Speed(request.swimmingSpeed),
            .burrowing: Speed(request.burrowingSpeed),
            .climbing: Speed(request.climbingSpeed),
        ]
    }
}
