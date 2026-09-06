import CellarsAndCentaurs

final class CreatureArchive {
    private let creatures: Creatures

    init(creatures: Creatures) {
        self.creatures = creatures
    }

    func archivedCount() -> Int {
        creatures.findAll().count
    }
}
