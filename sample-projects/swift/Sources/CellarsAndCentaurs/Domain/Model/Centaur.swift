final class Centaur: Creature {
    let XPValue: Int

    init(id: CreatureId, XPValue: Int) {
        self.XPValue = XPValue
        super.init(id: id, type: .monstrosity)
        speeds[.walking] = Speed(50)
    }

    override func takeDamage(_ amount: Int) {
        super.takeDamage(amount)
        if hitPoints?.current == 0 {
            speeds[.walking] = Speed.stationary
        }
    }
}
