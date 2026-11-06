package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

class PercentLiteral(private val keywordsBeforeAValue: Set<String>) {
    fun openerAt(line: String, position: Int): PercentOpener? {
        if (line[position] != PERCENT) return null
        val hasType = line.getOrNull(position + 1)?.let { it in TYPES } == true
        val delimiterIndex = if (hasType) position + 2 else position + 1
        val delimiter = line.getOrNull(delimiterIndex) ?: return null
        val isLiteral = if (hasType) isTypedLiteral(line, position, delimiter) else isUntypedLiteral(line, position, delimiter)
        if (!isLiteral) return null
        val closing = BRACKETS[delimiter] ?: delimiter
        return PercentOpener(Delimiters(delimiter.toString(), closing.toString()), delimiter in BRACKETS, delimiterIndex - position + 1)
    }

    private fun isTypedLiteral(line: String, position: Int, delimiter: Char): Boolean {
        val before = line.getOrNull(position - 1)
        val isAfterAValue = before != null && (before.isLetterOrDigit() || before in VALUE_ENDS)
        return !isAfterAValue && !delimiter.isLetterOrDigit() && !delimiter.isWhitespace()
    }

    private fun isUntypedLiteral(line: String, position: Int, delimiter: Char) = delimiter in BRACKETS &&
        (ValuePosition.isValueExpectedBefore(line, position, keywordsBeforeAValue) || isFirstArgument(line, position))

    private fun isFirstArgument(line: String, position: Int): Boolean {
        val isAfterSpace = line.getOrNull(position - 1)?.isWhitespace() == true
        val wordBefore = line.substring(0, position).trimEnd().takeLastWhile { it.isLetterOrDigit() || it in METHOD_NAME_CHARACTERS }
        return isAfterSpace && wordBefore.firstOrNull()?.isLetter() == true
    }

    companion object {
        private const val PERCENT = '%'
        private const val TYPES = "qQwWiIrsx"
        private const val VALUE_ENDS = "_)]}"
        private const val METHOD_NAME_CHARACTERS = "_?!"
        private val BRACKETS = mapOf('(' to ')', '[' to ']', '{' to '}', '<' to '>')
    }
}

data class PercentOpener(val delimiters: Delimiters, val isNestable: Boolean, val openerLength: Int)
