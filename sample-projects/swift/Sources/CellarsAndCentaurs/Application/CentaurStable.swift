enum CentaurStable {
    static func centaurs(in creatures: [Creature]) -> Int {
        creatures.compactMap { $0 as? Centaur }.count
    }
}
