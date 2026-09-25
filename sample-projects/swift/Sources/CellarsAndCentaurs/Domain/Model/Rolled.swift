@propertyWrapper
struct Rolled {
    private let dice: Dice
    private(set) var projectedValue: DiceRoll

    var wrappedValue: Int {
        mutating get {
            projectedValue = dice.roll()
            return projectedValue.value
        }
    }

    init(sides: Int) {
        dice = Dice(sides: sides)
        projectedValue = dice.roll()
    }
}
