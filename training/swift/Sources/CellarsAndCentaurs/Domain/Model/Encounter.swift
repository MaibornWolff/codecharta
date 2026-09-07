struct Encounter<T> where T: Fightable {
    let combatants: [T]

    func strike(_ target: T, for amount: Int) {
        target.takeDamage(amount)
    }

    func weakest() -> T? {
        combatants.min { ($0.hitPoints?.current ?? 0) < ($1.hitPoints?.current ?? 0) }
    }
}
