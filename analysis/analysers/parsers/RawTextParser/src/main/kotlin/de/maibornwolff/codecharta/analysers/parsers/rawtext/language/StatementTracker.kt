package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal class StatementTracker {
    private var bracketDepth = 0
    private var lastCodeCharacter: Char? = null
    private var isContinued = false

    var isAtStatementStart = true
        private set

    fun startLine() {
        isAtStatementStart = bracketDepth == 0 && !isContinued
        lastCodeCharacter = null
    }

    fun trackCode(character: Char) {
        lastCodeCharacter = character
        when (character) {
            in OPENING_BRACKETS -> bracketDepth++
            in CLOSING_BRACKETS -> bracketDepth = maxOf(0, bracketDepth - 1)
        }
    }

    fun endLine(isInsideRegion: Boolean) {
        isContinued = isInsideRegion || lastCodeCharacter == LINE_CONTINUATION
    }

    companion object {
        private const val OPENING_BRACKETS = "([{"
        private const val CLOSING_BRACKETS = ")]}"
        private const val LINE_CONTINUATION = '\\'
    }
}
