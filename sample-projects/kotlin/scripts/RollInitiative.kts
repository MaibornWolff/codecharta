import de.sots.cellarsandcentaurs.domain.model.Dice

// Rolls initiative for the wandering centaur.
class InitiativeScript(val dice: Dice) {
    fun rollInitiative(bonus: Int): Int {
        if (bonus > 5) {
            return dice.roll().d20Roll + bonus
        }
        return dice.roll().d20Roll
    }
}

println(InitiativeScript(Dice()).rollInitiative(2))
