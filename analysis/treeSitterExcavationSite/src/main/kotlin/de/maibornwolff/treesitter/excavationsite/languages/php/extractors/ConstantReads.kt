package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** Where a PHP name standing alone is the read of a constant: as an expression, not as the name of something else. */
internal object ConstantReads {
    private const val CONST_ELEMENT = "const_element"
    private const val BINARY_EXPRESSION = "binary_expression"
    private const val NAME_FIELD = "name"
    private const val RIGHT_FIELD = "right"
    private const val INSTANCEOF = "instanceof"

    private val EXPRESSION_PARENTS = setOf(
        BINARY_EXPRESSION, "unary_op_expression", "parenthesized_expression", "echo_statement", "expression_statement",
        "return_statement", "conditional_expression", "sequence_expression", "print_intrinsic", "throw_expression",
        "clone_expression", "cast_expression", "array_element_initializer", "match_condition_list",
        "match_conditional_expression", "case_statement", "variadic_unpacking", "yield_expression", "pair",
        "subscript_expression", "assignment_expression", "augmented_assignment_expression",
        "reference_assignment_expression", "exit_statement", "argument", CONST_ELEMENT, "enum_case", "simple_parameter",
        "property_promotion_parameter", "property_element", "static_variable_declaration", "include_expression",
        "include_once_expression", "require_expression", "require_once_expression"
    )

    fun isRead(name: SyntaxNode): Boolean {
        val parent = name.parent
        if (parent.type !in EXPRESSION_PARENTS) return false
        if (parent.getChildByFieldName(NAME_FIELD).orNull() == name) return false
        if (parent.type == CONST_ELEMENT) return parent.namedChildren().firstOrNull() != name
        return parent.type != BINARY_EXPRESSION || !isInstanceofClass(name)
    }

    private fun isInstanceofClass(name: SyntaxNode): Boolean {
        val expression = name.parent
        return expression.getChildByFieldName(RIGHT_FIELD).orNull() == name && expression.children().any { it.type == INSTANCEOF }
    }
}
