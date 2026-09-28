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
 */
class NestedNodeType(
    val baseNodeType: String,
    val childNodeFieldName: String? = null,
    val childNodeCount: Int? = null,
    val childNodePosition: Int? = null,
    val childNodeTypes: Set<String>
)
