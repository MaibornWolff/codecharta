package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

/**
 * Defines a nested node type match pattern.
 *
 * Used for metrics that require matching a parent node with specific child characteristics.
 * For example, binary_expression with an && or || operator, or function_declaration with
 * a function_body child.
 *
 * @param baseNodeType The parent node type to match
 * @param childNodeFieldName The field name to use when looking up the child (optional)
 * @param childNodeCount Required number of children for position-based matching (optional)
 * @param childNodePosition Position of the child to check (optional)
 * @param childNodeTypes Set of allowed child node types
 * @param matchesAnyChild Whether any direct child of an allowed type is enough (optional)
 * @param parentNodeTypes Set of allowed parent node types, checked instead of the children (optional)
 * @param childNodeTexts Set of allowed texts of a direct child of an allowed type, checked instead of its type alone
 * (optional)
 * @param allOf Patterns that must all match, checked instead of every other parameter (optional)
 */
class NestedNodeType(
    val baseNodeType: String,
    val childNodeFieldName: String? = null,
    val childNodeCount: Int? = null,
    val childNodePosition: Int? = null,
    val childNodeTypes: Set<String> = emptySet(),
    val matchesAnyChild: Boolean = false,
    val parentNodeTypes: Set<String>? = null,
    val childNodeTexts: Set<String>? = null,
    val allOf: List<NestedNodeType>? = null
)
