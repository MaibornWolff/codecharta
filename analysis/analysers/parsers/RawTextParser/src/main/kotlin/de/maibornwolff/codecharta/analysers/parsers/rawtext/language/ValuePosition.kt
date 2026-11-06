package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal object ValuePosition {
    private const val OPERATORS_BEFORE_A_VALUE = "(,=:[!&|?{};+-*%<>~^"

    fun isValueExpectedBefore(line: String, position: Int, keywordsBeforeAValue: Set<String>): Boolean {
        val before = line.substring(0, position).trimEnd()
        val last = before.lastOrNull() ?: return true
        if (last in OPERATORS_BEFORE_A_VALUE) return true
        return before.takeLastWhile { it.isLetterOrDigit() || it == '_' || it == '$' } in keywordsBeforeAValue
    }
}
