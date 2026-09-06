struct Dice {
    let sides: Int

    func roll() -> DiceRoll {
        DiceRoll(dice: self, value: Int.random(in: 1...sides))
    }
}

struct DiceRoll {
    let dice: Dice
    let value: Int

    var isCriticalHit: Bool { value == dice.sides }
}

func rollD20() -> DiceRoll {
    let d20Roll = Dice(sides: 20).roll()
    return d20Roll
}
