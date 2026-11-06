package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal class HeredocTracker(private val openers: List<HeredocOpener>) {
    private val terminators = ArrayDeque<String>()

    val isInBody: Boolean get() = terminators.isNotEmpty()

    fun openerLengthAt(line: String, position: Int): Int? {
        if (line.getOrNull(position - 1) == HEREDOC_START) return null
        val match = openers.firstNotNullOfOrNull { it.terminatorAt(line, position) } ?: return null
        terminators.addLast(match.terminator)
        return match.openerLength
    }

    fun readBodyLine(line: String) {
        val terminator = terminators.first()
        val content = line.trimStart()
        val isTerminator = content.startsWith(terminator) && content.getOrNull(terminator.length)?.isWordCharacter() != true
        if (isTerminator) terminators.removeFirst()
    }

    private fun Char.isWordCharacter() = isLetterOrDigit() || this == '_'

    companion object {
        private const val HEREDOC_START = '<'
    }
}
