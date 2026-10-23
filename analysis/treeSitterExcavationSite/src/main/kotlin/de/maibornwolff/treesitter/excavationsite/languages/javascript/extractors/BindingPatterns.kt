package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** What a parameter or a destructuring declaration binds. */
internal object BindingPatterns {
    private const val SHORTHAND_PATTERN = "shorthand_property_identifier_pattern"
    private const val ASSIGNMENT_PATTERN = "assignment_pattern"
    private const val REQUIRED_PARAMETER = "required_parameter"
    private const val OPTIONAL_PARAMETER = "optional_parameter"
    private const val REST_PATTERN = "rest_pattern"
    private const val AWAIT_EXPRESSION = "await_expression"
    private const val IMPORT_KEYWORD = "import"
    private const val PATTERN_FIELD = "pattern"
    private const val LEFT_FIELD = "left"
    private const val FUNCTION_FIELD = "function"

    /** The names a parameter or destructuring pattern binds. */
    fun boundNames(pattern: SyntaxNode): List<String> = when (pattern.type) {
        IDENTIFIER, SHORTHAND_PATTERN -> listOf(pattern.text.trim())
        REQUIRED_PARAMETER, OPTIONAL_PARAMETER -> boundNamesOfField(pattern, PATTERN_FIELD)
        PAIR_PATTERN -> boundNamesOfField(pattern, VALUE_FIELD)
        ASSIGNMENT_PATTERN -> boundNamesOfField(pattern, LEFT_FIELD)
        OBJECT_PATTERN, ARRAY_PATTERN, REST_PATTERN -> pattern.namedChildren().flatMap { boundNames(it) }.toList()
        else -> emptyList()
    }

    /** Whether a declarator binds what a module exports: `const { A } = await import('./m')` or `require('./m')`. */
    fun bindsModule(declarator: SyntaxNode): Boolean {
        val value = declarator.getChildByFieldName(VALUE_FIELD).orNull() ?: return false
        val call = (if (value.type == AWAIT_EXPRESSION) value.namedChildren().firstOrNull() else value)
            ?.takeIf { it.type == CALL_EXPRESSION } ?: return false
        val function = call.getChildByFieldName(FUNCTION_FIELD).orNull() ?: return false
        return function.type == IMPORT_KEYWORD || (function.type == IDENTIFIER && function.text == REQUIRE)
    }

    private fun boundNamesOfField(pattern: SyntaxNode, field: String): List<String> =
        pattern.getChildByFieldName(field).orNull()?.let { boundNames(it) }.orEmpty()
}
