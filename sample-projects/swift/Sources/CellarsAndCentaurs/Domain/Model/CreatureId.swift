import struct Foundation.UUID

struct CreatureId: Hashable {
    let value: String

    init(_ value: String) {
        self.value = value
    }

    static func random() -> CreatureId {
        CreatureId(UUID().uuidString)
    }
}
