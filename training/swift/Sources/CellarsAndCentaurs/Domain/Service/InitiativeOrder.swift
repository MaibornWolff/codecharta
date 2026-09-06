enum InitiativeOrder {
    static func bonus(for creature: Creature) -> Int {
        switch creature {
        case let centaur as Centaur:
            return centaur.XPValue / 100
        default:
            return 0
        }
    }
}
