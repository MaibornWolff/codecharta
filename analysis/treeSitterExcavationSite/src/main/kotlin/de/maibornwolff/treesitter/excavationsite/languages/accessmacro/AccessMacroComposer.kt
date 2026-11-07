package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.Macro
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroAction
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroArguments
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroComment
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroConditional
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroGroup
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroReader
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroStatement
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedRoutine
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language

/**
 * Takes a macro apart into VBA: the statements outside every submacro as one routine of the file, each submacro as a
 * routine of its own, an `If` block as an `If` statement, each expression the value of an assignment, an error
 * handler that jumps to a submacro as `On Error GoTo`. Its real lines are its actions and conditions.
 */
internal object AccessMacroComposer {
    /** The routine and the variable of the expressions are named with one letter, which is no word of the domain. */
    const val EXPRESSION_ROUTINE = "L"
    private const val NEWLINE = "\n"

    fun compose(content: String): ComposedSource {
        val lines = content.lines().size - if (content.endsWith(NEWLINE)) 1 else 0
        return composedOf(MacroReader.read(content), lines)
    }

    /** The parts, lines and texts of [macro], in a file of [lines]. */
    fun composedOf(macro: Macro, lines: Int): ComposedSource {
        val bodies = listOf(macro.statements) + macro.submacros.map { it.statements }
        return ComposedSource(
            codeParts = listOfNotNull(macro.statements.takeIf { routineLinesOf(it).isNotEmpty() }?.let { routineOf(it) }),
            codeLines = bodies.sumOf { codeLinesOf(it) },
            lines = lines,
            texts = macro.submacros.map { ExtractedText(it.name, ExtractionContext.IDENTIFIER) } + bodies.flatMap { textsOf(it) },
            commentLines = bodies.sumOf { commentLinesOf(it) },
            routines = macro.submacros.map { ComposedRoutine(routineOf(it.statements), codeLinesOf(it.statements)) }
        )
    }

    private fun routineOf(statements: List<MacroStatement>): EmbeddedSource {
        val body = routineLinesOf(statements).joinToString("") { it + NEWLINE }
        return EmbeddedSource("Sub $EXPRESSION_ROUTINE()$NEWLINE${body}End Sub$NEWLINE", Language.VBA)
    }

    private fun routineLinesOf(statements: List<MacroStatement>): List<String> = statements.flatMap { statement ->
        when (statement) {
            is MacroAction -> actionLinesOf(statement)
            is MacroConditional -> conditionalLinesOf(statement)
            is MacroGroup -> routineLinesOf(statement.statements)
            is MacroComment -> emptyList()
        }
    }

    private fun actionLinesOf(action: MacroAction): List<String> =
        listOfNotNull(MacroArguments.errorHandlerOf(action)?.let { "On Error GoTo $EXPRESSION_ROUTINE" }) +
            MacroArguments.expressionsOf(action).map { "$EXPRESSION_ROUTINE = ${oneLine(it)}" }

    private fun conditionalLinesOf(conditional: MacroConditional): List<String> =
        conditional.branches.withIndex().flatMap { (index, branch) ->
            val header = when {
                branch.condition == null -> "Else"
                index == 0 -> "If ${oneLine(branch.condition)} Then"
                else -> "ElseIf ${oneLine(branch.condition)} Then"
            }
            listOf(header) + routineLinesOf(branch.statements)
        } + "End If"

    private fun oneLine(expression: String): String = expression.lines().joinToString(" ")

    private fun codeLinesOf(statements: List<MacroStatement>): Int = statements.sumOf { statement ->
        when (statement) {
            is MacroAction -> 1
            is MacroConditional -> statement.branches.sumOf { (if (it.condition != null) 1 else 0) + codeLinesOf(it.statements) }
            is MacroGroup -> codeLinesOf(statement.statements)
            is MacroComment -> 0
        }
    }

    private fun commentLinesOf(statements: List<MacroStatement>): Int = statements.sumOf { statement ->
        when (statement) {
            is MacroAction -> 0
            is MacroConditional -> statement.branches.sumOf { commentLinesOf(it.statements) }
            is MacroGroup -> commentLinesOf(statement.statements)
            is MacroComment -> statement.text.lines().size
        }
    }

    // A text is unescaped already, as the macro reader reads it
    private fun textsOf(statements: List<MacroStatement>): List<ExtractedText> = statements.flatMap { statement ->
        when (statement) {
            is MacroAction -> MacroArguments.objectNamesOf(statement).map { ExtractedText(it, ExtractionContext.IDENTIFIER) } +
                MacroArguments.messagesOf(statement).map { ExtractedText(it, ExtractionContext.STRING, interpretsEscapes = false) }
            is MacroConditional -> statement.branches.flatMap { textsOf(it.statements) }
            is MacroGroup -> listOf(ExtractedText(statement.name, ExtractionContext.IDENTIFIER)) + textsOf(statement.statements)
            is MacroComment -> listOf(ExtractedText(statement.text, ExtractionContext.COMMENT, interpretsEscapes = false))
        }
    }
}
