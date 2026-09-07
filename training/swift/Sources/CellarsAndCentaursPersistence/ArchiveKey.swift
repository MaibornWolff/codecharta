@_implementationOnly import CellarsAndCentaurs

struct ArchiveKey: Hashable {
    let value: String

    init(_ id: CreatureId) {
        value = id.value
    }
}
