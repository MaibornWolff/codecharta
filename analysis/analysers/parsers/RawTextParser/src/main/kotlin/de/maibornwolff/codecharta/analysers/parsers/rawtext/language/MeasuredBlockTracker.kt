package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal class MeasuredBlockTracker(private val block: MeasuredBlock?) {
    private var state = State.BEFORE

    fun isMeasured(line: String): Boolean {
        if (block == null) return true
        state = nextState(block, line)
        return state == State.INSIDE
    }

    private fun nextState(block: MeasuredBlock, line: String): State = when (state) {
        State.BEFORE -> when {
            !block.opensAt(line) -> State.BEFORE
            block.closesAt(line) -> State.AFTER
            else -> State.OPENED
        }
        State.OPENED, State.INSIDE -> if (block.closesAt(line)) State.AFTER else State.INSIDE
        State.AFTER -> State.AFTER
    }

    private enum class State { BEFORE, OPENED, INSIDE, AFTER }
}
