package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

class RegexLiteral(private val keywordsBeforeAValue: Set<String>) {
    fun lengthAt(line: String, position: Int): Int? {
        if (line[position] != SLASH || !ValuePosition.isValueExpectedBefore(line, position, keywordsBeforeAValue)) return null
        val closingSlash = closingSlashAfter(line, position + 1) ?: return null
        return closingSlash - position + 1
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

    companion object {
        private const val SLASH = '/'
        private const val ESCAPE = '\\'
    }
}
