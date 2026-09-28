extension Creature: CustomStringConvertible {
    var description: String {
        "\(type.rawValue) \(id.value) ac=\(armorClass?.total ?? 0) hp=\(hitPoints?.current ?? 0)"
    }
}

extension Centaur {
    var stableName: String { CreatureFacade.STABLE_NAME }
}
