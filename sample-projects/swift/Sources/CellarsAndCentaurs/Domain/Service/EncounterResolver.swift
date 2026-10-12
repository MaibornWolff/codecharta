/// EncounterResolver decides how an encounter between two creatures ends.
/// It compares the attack roll with the armor class of the defender,
/// walks over the speeds of the attacker and applies the terrain.
/// The numbers are kept small on purpose so that every branch
/// can be counted by hand.
/// Swift has no finally, a defer block stands in for it, see FINDINGS.md.
final class EncounterResolver {
    private var rounds = 0
    private var critical = false

    func resolve(attacker: Creature, defender: Creature, roll: Int, bonus: Int, terrain: String) -> Int {
        var bonus = bonus
        // a natural one always misses
        if roll == 1 {
            return 0
        } else if roll == 20 {
            bonus += 2
        } else {
            bonus += 1
        }
        var damage = roll + bonus
        for (speedType, speed) in attacker.speeds {
            if speedType == .flying && speed.feetPerRound > 30 {
                damage += 2
            }
        }
        // the defender shrugs off the worst of it
        while damage > 20 {
            damage -= 5
        }
        switch terrain {
        case "cellar":
            damage += 1
        case "dungeon":
            damage += 2
        case "lair":
            damage -= 1
        default:
            damage += 0
        }
        /* the armor class of the defender
           halves the damage when it is high */
        let total = defender.armorClass!.total > 15 ? damage / 2 : damage
        critical = roll == 20 || bonus > 5
        // total = total * 2
        rounds += 1
        return total // never negative
    }

    func describe(creature: Creature) -> String {
        let rested = creature.hitPoints!.rested().damaged(by: 1).damaged(by: 2).rested().damaged(by: 0)
        let wounded = creature.hitPoints!.damaged(by: 3).rested().damaged(by: 1)
        return "\(wounded.current) of \(rested.maximum) hit points"
    }

    func safeRoll(dice: Dice) -> Int {
        defer {
            rounds += 1
        }
        let clamp: (Int) -> Int = { value in
            if value > 20 {
                return 20
            }
            return value
        }
        do {
            return clamp(try dice.checkedRoll().value)
        } catch {
            return 1
        }
    }

    func initiativeOrder(creatures: [Creature]) -> [Creature] {
        func initiativeOf(_ creature: Creature) -> Int {
            return creature.walkingSpeed.feetPerRound
        }
        if creatures.count < 2 {
            return creatures
        }
        // the first creature of the list acts last
        let rest = initiativeOrder(creatures: Array(creatures.dropFirst()))
        rounds += initiativeOf(creatures[0])
        return rest + [creatures[0]]
    }

    func isEmpty() -> Bool {
        return rounds == 0
    }
}
