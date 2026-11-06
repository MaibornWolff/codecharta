package de.maibornwolff.treesitter.excavationsite.languages.accesslayout

import de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors.LayoutLogic
import de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors.LayoutLogicReader
import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language

/**
 * Takes a form or report layout apart into its code: the expressions as one VBA routine, each the value of an
 * assignment, and the SQL of each record or row source. The names of its controls and the fields they show are its
 * identifiers, the captions its strings.
 */
internal object AccessLayoutComposer {
    /** The routine and the variable of the expressions are named with one letter, which is no word of the domain. */
    const val EXPRESSION_ROUTINE = "L"

    fun compose(content: String): ComposedSource {
        val logic = LayoutLogicReader.read(content)
        val codeParts = listOfNotNull(expressionRoutineOf(logic)) + logic.queries.map { EmbeddedSource(it, Language.SQL) }
        return ComposedSource(
            codeParts,
            logic.logicLines,
            logic.lines,
            mapOf(AvailableFileMetrics.NUMBER_OF_CONTROLS to logic.controls),
            textsOf(logic)
        )
    }

    // A caption is unescaped already, as the layout reader reads it
    private fun textsOf(logic: LayoutLogic): List<ExtractedText> = logic.names.map { ExtractedText(it, ExtractionContext.IDENTIFIER) } +
        logic.captions.map { ExtractedText(it, ExtractionContext.STRING, interpretsEscapes = false) }

    /** The expressions of [logic] as one VBA routine, each the value of an assignment, or null for a layout without any. */
    fun expressionRoutineOf(logic: LayoutLogic): EmbeddedSource? {
        if (logic.expressions.isEmpty()) return null
        val assignments = logic.expressions.joinToString("\n") { "$EXPRESSION_ROUTINE = ${it.lines().joinToString(" ")}" }
        return EmbeddedSource("Sub $EXPRESSION_ROUTINE()\n$assignments\nEnd Sub\n", Language.VBA)
    }
}
