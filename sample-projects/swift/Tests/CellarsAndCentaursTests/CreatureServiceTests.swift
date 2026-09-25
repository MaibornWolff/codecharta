import XCTest
@testable import CellarsAndCentaurs

final class CreatureServiceTests: XCTestCase {
    private var creatureService: CreatureService!
    private var creatures: InMemoryCreatures!

    override func setUp() {
        super.setUp()
        creatures = InMemoryCreatures()
        creatureService = CreatureService(creatures: creatures)
    }

    func test_should_save_creature_to_the_stable() throws {
        // Arrange
        let walking_speed = Speed(40)
        let creature = Creature(id: CreatureId("centaur-1"))
        creature.speeds[.walking] = walking_speed

        // Act
        try creatureService.save(creature)

        // Assert
        XCTAssertEqual(creatures.findAll().count, 1)
        XCTAssertEqual(try creatureService.find(creature.id).walkingSpeed, walking_speed)
    }

    func test_should_throw_when_creature_is_unknown() {
        // Arrange
        let unknownId = CreatureId("nobody")

        // Act & Assert
        XCTAssertThrowsError(try creatureService.find(unknownId))
    }
}

private final class InMemoryCreatures: Creatures {
    private var stored: [CreatureId: Creature] = [:]

    func save(_ creature: Creature) throws { stored[creature.id] = creature }

    func find(_ id: CreatureId) throws -> Creature {
        guard let creature = stored[id] else { throw NoSuchCreatureException(id: id) }
        return creature
    }

    func findAll() -> [Creature] { Array(stored.values) }
}
