package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal object RegexLiteral {
    private const val SLASH = '/'
    private const val ESCAPE = '\\'
    private const val OPERATORS_BEFORE_A_VALUE = "(,=:[!&|?{};+-*%<>~^"
    private val KEYWORDS_BEFORE_A_VALUE = setOf(
        "return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"
    )

    fun lengthAt(line: String, position: Int): Int? {
        if (line[position] != SLASH || !isValueExpectedBefore(line, position)) return null
        val closingSlash = closingSlashAfter(line, position + 1) ?: return null
        return closingSlash - position + 1
    }

    private fun isValueExpectedBefore(line: String, position: Int): Boolean {
        val before = line.substring(0, position).trimEnd()
        val last = before.lastOrNull() ?: return true
        if (last in OPERATORS_BEFORE_A_VALUE) return true
        return before.takeLastWhile { it.isLetterOrDigit() || it == '_' || it == '$' } in KEYWORDS_BEFORE_A_VALUE
    }

    private fun closingSlashAfter(line: String, start: Int): Int? {
        var isInCharacterClass = false
        var index = start
        while (index < line.length) {
            when (line[index]) {
                ESCAPE -> index++
                '[' -> isInCharacterClass = true
                ']' -> isInCharacterClass = false
                SLASH -> if (!isInCharacterClass) return index
            }
            index++
        }
        return null
    }
}
