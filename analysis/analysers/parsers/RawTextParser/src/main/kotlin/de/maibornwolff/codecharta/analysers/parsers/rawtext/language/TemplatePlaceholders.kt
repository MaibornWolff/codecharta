package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal class TemplatePlaceholders<Template> {
    private val suspendedTemplates = ArrayDeque<Template>()
    private val braceDepths = ArrayDeque<Int>()

    fun enter(template: Template) {
        suspendedTemplates.addLast(template)
        braceDepths.addLast(0)
    }

    fun templateResumedBy(character: Char): Template? {
        if (suspendedTemplates.isEmpty()) return null
        val depth = braceDepths.last()
        return when {
            character == OPENING_BRACE -> null.also { braceDepths[braceDepths.lastIndex] = depth + 1 }
            character != CLOSING_BRACE -> null
            depth > 0 -> null.also { braceDepths[braceDepths.lastIndex] = depth - 1 }
            else -> suspendedTemplates.removeLast().also { braceDepths.removeLast() }
        }
    }

    companion object {
        private const val OPENING_BRACE = '{'
        private const val CLOSING_BRACE = '}'
    }
}
