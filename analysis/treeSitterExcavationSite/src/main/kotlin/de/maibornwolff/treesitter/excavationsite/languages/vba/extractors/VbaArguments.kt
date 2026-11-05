package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaNameKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The arguments of a call, by position or by name, and the object name a literal among them holds. */
internal object VbaArguments {
    private const val STRING_LITERAL = "string_literal"
    private const val PARENTHESIZED_EXPRESSION = "parenthesized_expression"
    private const val NAMED_ARGUMENT = "named_argument"
    private const val NAME_FIELD = "name"
    private const val VALUE_FIELD = "value"
    private const val QUOTE = "\""
    private val SQL_TEXT = Regex("""^\s*(select|insert|update|delete|transform|parameters)\b""", RegexOption.IGNORE_CASE)

    /** The literal name the argument named [parameterName] holds, or else the [index]th positional argument. */
    fun literalArgument(arguments: SyntaxNode, index: Int, parameterName: String): String? =
        namedArgument(arguments, parameterName)?.let { literalOf(it) } ?: positionalLiteral(arguments, index)

    /** The argument named [parameterName], or else the [index]th positional argument. */
    fun argument(arguments: SyntaxNode, index: Int, parameterName: String): SyntaxNode? =
        namedArgument(arguments, parameterName) ?: positionalArguments(arguments).getOrNull(index)

    fun positionalLiteral(arguments: SyntaxNode, index: Int): String? =
        positionalArguments(arguments).getOrNull(index)?.let { literalOf(it) }

    /** The object name a string literal holds, null for SQL text or any other expression. */
    fun literalOf(expression: SyntaxNode): String? = when (expression.type) {
        STRING_LITERAL -> nameIn(expression.text)
        PARENTHESIZED_EXPRESSION -> expression.namedChildren().singleOrNull()?.let { literalOf(it) }
        else -> null
    }

    fun named(name: String?, kind: VbaNameKind): VbaName? = name?.let { VbaName(listOf(it), kind) }

    private fun positionalArguments(arguments: SyntaxNode): List<SyntaxNode> =
        arguments.namedChildren().takeWhile { it.type != NAMED_ARGUMENT }.toList()

    private fun namedArgument(arguments: SyntaxNode, parameterName: String): SyntaxNode? = arguments
        .namedChildren()
        .filter { it.type == NAMED_ARGUMENT }
        .firstOrNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text.equals(parameterName, ignoreCase = true) }
        ?.getChildByFieldName(VALUE_FIELD)
        ?.orNull()

    private fun nameIn(literal: String): String? =
        literal.removeSurrounding(QUOTE).replace(QUOTE + QUOTE, QUOTE).takeUnless { SQL_TEXT.containsMatchIn(it) }
}
