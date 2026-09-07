protocol Fightable {
    var armorClass: ArmorClass? { get }
    var hitPoints: HitPoints? { get }

    func takeDamage(_ amount: Int)
}
