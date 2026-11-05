package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaNameKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The Access forms and reports code names by a literal: `DoCmd.OpenForm "x"` (or `FormName:="x"`), `DoCmd.OpenReport`,
 * `Forms!x`, `Forms("x")`, `Reports!x` and `Reports("x")`. A name held in a variable names none.
 */
internal object VbaAccessObjects {
    private const val DO_CMD = "docmd"
    private const val STRING_LITERAL = "string_literal"
    private const val PARENTHESIZED_EXPRESSION = "parenthesized_expression"
    private const val NAMED_ARGUMENT = "named_argument"
    private const val NAME_FIELD = "name"
    private const val VALUE_FIELD = "value"
    private const val QUOTE = "\""

    private data class Opener(val kind: VbaNameKind, val parameterName: String)

    private val COLLECTIONS = mapOf("forms" to VbaNameKind.FORM, "reports" to VbaNameKind.REPORT)
    private val OPENERS = mapOf(
        "openform" to Opener(VbaNameKind.FORM, "FormName"),
        "openreport" to Opener(VbaNameKind.REPORT, "ReportName")
    )

    /** The object `Forms!member` or `Reports!member` names, null for any other [collection]. */
    fun namedBy(collection: String, member: String): VbaName? = COLLECTIONS[collection.lowercase()]?.let { VbaName(listOf(member), it) }

    /** The object a call of the plain chain [callee] opens or names with [arguments], null for any other call. */
    fun openedBy(callee: List<String>, arguments: SyntaxNode?): VbaName? {
        if (arguments == null) return null
        val collection = callee.singleOrNull()?.let { COLLECTIONS[it.lowercase()] }
        if (collection != null) return positionalLiteral(arguments)?.let { VbaName(listOf(it), collection) }
        if (callee.size < 2 || !callee[callee.size - 2].equals(DO_CMD, ignoreCase = true)) return null
        val opener = OPENERS[callee.last().lowercase()] ?: return null
        return (namedLiteral(arguments, opener.parameterName) ?: positionalLiteral(arguments))?.let { VbaName(listOf(it), opener.kind) }
    }

    private fun positionalLiteral(arguments: SyntaxNode): String? =
        arguments.namedChildren().firstOrNull()?.takeIf { it.type != NAMED_ARGUMENT }?.let { literalOf(it) }

    private fun namedLiteral(arguments: SyntaxNode, parameterName: String): String? = arguments
        .namedChildren()
        .filter { it.type == NAMED_ARGUMENT }
        .firstOrNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text.equals(parameterName, ignoreCase = true) }
        ?.getChildByFieldName(VALUE_FIELD)
        ?.orNull()
        ?.let { literalOf(it) }

    private fun literalOf(expression: SyntaxNode): String? = when (expression.type) {
        STRING_LITERAL -> expression.text.removeSurrounding(QUOTE).replace(QUOTE + QUOTE, QUOTE)
        PARENTHESIZED_EXPRESSION -> expression.namedChildren().singleOrNull()?.let { literalOf(it) }
        else -> null
    }
}
