protocol Lair {
    associatedtype Occupant: Creature

    var occupants: [Occupant] { get }

    mutating func shelter(_ occupant: Occupant)
}
