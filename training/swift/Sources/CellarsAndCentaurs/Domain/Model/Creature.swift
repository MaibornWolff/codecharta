import Logging

/// A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
class Creature: Fightable {
    private static let logger = Logger(label: "de.sots.cellarsandcentaurs.domain.model.Creature")

    let id: CreatureId
    var type: CreatureType
    var armorClass: ArmorClass?
    var hitPoints: HitPoints?
    var speeds: [SpeedType: Speed] = [:]

    init(id: CreatureId, type: CreatureType = CreatureFacade.STANDARD_CREATURE_TYPE) {
        self.id = id
        self.type = type
    }

    var walkingSpeed: Speed {
        speeds[.walking] ?? Speed.stationary
    }

    func takeDamage(_ amount: Int) {
        Creature.logger.info("creature \(id.value) takes \(amount) damage")
        hitPoints = hitPoints?.damaged(by: amount)
    }
}
