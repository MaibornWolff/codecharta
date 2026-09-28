struct NoSuchCreatureException: Error, CustomStringConvertible {
    let id: CreatureId

    var description: String {
        "No such creature in the dungeon: " + id.value
    }
}
