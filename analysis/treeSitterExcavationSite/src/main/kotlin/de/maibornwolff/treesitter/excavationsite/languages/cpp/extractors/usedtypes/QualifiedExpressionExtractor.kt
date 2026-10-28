package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * A qualified name in an expression, `SpeedType::WALKING` or `Speed::MAX`, as a use of what it names with its
 * qualifier; the lookup of `cpp.md` reads a member below a class as a use of the class. Types, declarators and base
 * classes in qualified form are left to the extractors of their places.
 */
internal object QualifiedExpressionExtractor {
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private val NON_EXPRESSION_PARENTS = setOf(
        QUALIFIED_IDENTIFIER,
        "function_declarator",
        "using_declaration",
        "namespace_alias_definition",
        "base_class_clause",
        "friend_declaration",
        "type_descriptor",
        "template_argument_list",
        "field_declaration",
        "declaration",
        "parameter_declaration",
        "optional_parameter_declaration",
        "alias_declaration",
        "type_definition",
        "function_definition",
        "trailing_return_type",
        "new_expression"
    )

    val nodeTypes: Set<String> = setOf(QUALIFIED_IDENTIFIER)

    fun extractQualifiedExpressionTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> = buckets[QUALIFIED_IDENTIFIER]
        .orEmpty()
        .filter { it.parent.type !in NON_EXPRESSION_PARENTS }
        .mapNotNull { CppTypeHelper.extractRightmostSegment(it) }
}
