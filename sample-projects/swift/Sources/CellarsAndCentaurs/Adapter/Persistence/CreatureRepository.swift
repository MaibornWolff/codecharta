import Foundation
import Logging

typealias Entity = CreatureEntity

final class CreatureRepository: Repository<Entity> {
    private let logger = Logger(label: "de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository")

    override func save(_ item: Entity) {
        logger.debug("saving entity \(item.id)")
        super.save(item)
    }

    func findByType(_ typeName: String) -> [Entity] {
        findAll().filter { $0.typeName == typeName }
    }
}
