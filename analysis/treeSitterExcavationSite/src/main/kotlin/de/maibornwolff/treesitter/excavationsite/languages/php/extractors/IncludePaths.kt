package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The path an include names, by "Includes" of `php.md`: a string literal as written, `__DIR__ . 'literal'` and
 * `dirname(__FILE__) . 'literal'` as the literal relative to the including file, each in parentheses as well, with
 * slashes for backslashes. Null for any other expression.
 */
internal object IncludePaths {
    /** The name of a use of an included file's script leaf, the marker JavaScript gives a side-effect import. */
    const val INCLUDED_SCRIPT = "MODULE_SCRIPT"
    val INCLUDE_EXPRESSIONS = setOf("include_expression", "include_once_expression", "require_expression", "require_once_expression")

    private const val STRING = "string"
    private const val NAME = "name"
    private const val BINARY_EXPRESSION = "binary_expression"
    private const val FUNCTION_CALL_EXPRESSION = "function_call_expression"
    private const val ENCAPSED_STRING = "encapsed_string"
    private const val STRING_CONTENT = "string_content"
    private const val PARENTHESIZED_EXPRESSION = "parenthesized_expression"
    private const val CONCATENATION = "."
    private const val DIRECTORY_CONSTANT = "__dir__"
    private const val FILE_CONSTANT = "__file__"
    private const val DIRNAME = "dirname"
    private const val LEFT_FIELD = "left"
    private const val RIGHT_FIELD = "right"
    private const val FUNCTION_FIELD = "function"
    private const val ARGUMENTS_FIELD = "arguments"
    private const val PATH_SEPARATOR = "/"
    private const val NAMESPACE_SEPARATOR = "\\"

    fun of(include: SyntaxNode): String? {
        val path = include.namedChildren().firstOrNull()?.let { unwrapped(it) } ?: return null
        val written = literalOf(path) ?: directoryRelative(path) ?: return null
        return written.replace(NAMESPACE_SEPARATOR, PATH_SEPARATOR)
    }

    private fun unwrapped(expression: SyntaxNode): SyntaxNode = if (expression.type ==
        PARENTHESIZED_EXPRESSION
    ) {
        expression.namedChildren().firstOrNull()?.let { unwrapped(it) } ?: expression
    } else {
        expression
    }

    private fun literalOf(expression: SyntaxNode): String? {
        if (expression.type != STRING && expression.type != ENCAPSED_STRING) return null
        val parts = expression.namedChildren().toList()
        if (parts.any { it.type != STRING_CONTENT }) return null
        return parts.joinToString("") { it.text }
    }

    // The literal behind `__DIR__ .` or `dirname(__FILE__) .`, without its leading separator
    private fun directoryRelative(expression: SyntaxNode): String? {
        if (expression.type != BINARY_EXPRESSION || expression.children().none { it.type == CONCATENATION }) return null
        val left = expression.getChildByFieldName(LEFT_FIELD).orNull() ?: return null
        if (!namesDirectory(left)) return null
        return expression.getChildByFieldName(RIGHT_FIELD).orNull()?.let { literalOf(it) }?.removePrefix(PATH_SEPARATOR)
    }

    private fun namesDirectory(expression: SyntaxNode): Boolean {
        if (expression.type == NAME) return expression.text.lowercase() == DIRECTORY_CONSTANT
        if (expression.type != FUNCTION_CALL_EXPRESSION) return false
        val function = expression.getChildByFieldName(FUNCTION_FIELD).orNull() ?: return false
        val argument = expression.getChildByFieldName(ARGUMENTS_FIELD).orNull()?.namedChildren()?.singleOrNull() ?: return false
        return function.text.lowercase() == DIRNAME && argument.text.lowercase() == FILE_CONSTANT
    }
}
