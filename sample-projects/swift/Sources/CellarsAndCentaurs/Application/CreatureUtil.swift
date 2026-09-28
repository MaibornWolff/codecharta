import Foundation

enum CreatureUtil {
    static let STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor"

    /*
     Counts the treasure hoard a creature guards.
     */
    static func treasureHoard(of creature: Creature) -> Int {
        let hoard = (creature.hitPoints?.maximum ?? 0) * 10
        return hoard
    }

    static func describe(_ creatures: [Creature]) -> [String: Int] {
        Dictionary(grouping: creatures, by: { $0.type.rawValue }).mapValues { $0.count }
    }
}
