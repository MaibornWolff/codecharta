import Foundation

struct CreatureEntity: Codable, Identifiable {
    let id: String
    let typeName: String
    let currentHitPoints: Int
    let maximumHitPoints: Int

    init(id: String = UUID().uuidString, typeName: String, currentHitPoints: Int, maximumHitPoints: Int) {
        self.id = id
        self.typeName = typeName
        self.currentHitPoints = currentHitPoints
        self.maximumHitPoints = maximumHitPoints
    }
}
