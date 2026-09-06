package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Declarative rules for ignoring nodes during metric calculations.
 *
 * These rules are evaluated by CalculationExtensionsFactory to build
 * the actual filter lambdas used during tree traversal.
 */
sealed class IgnoreRule {
    /**
     * Ignore nodes where nodeType matches and parent type matches.
     * Example: Ignore "identifier" when parent is "function_definition" (function name, not parameter)
     */
    data class TypeWithParentType(val nodeType: String, val parentType: String) : IgnoreRule()

    /**
     * Ignore nodes where nodeType is in the given set.
     * Example: Ignore "string_start", "string_content", "string_end" for RLOC
     */
    data class TypeInSet(val types: Set<String>) : IgnoreRule()

    /**
     * Ignore nodes where nodeType equals parent type and nodeType is in set.
     * Used in Ruby to prevent double-counting nested control structures.
     * Example: "if" inside "if" should not be counted twice
     */
    data class TypeEqualsParentTypeWhenInSet(val types: Set<String>) : IgnoreRule()

    /**
     * Ignore nodes where parent has exactly one child and nodeType matches.
     * Used for Python docstrings: "string" with single-child parent is a docstring.
     */
    data class SingleChildOfParentWithType(val nodeType: String) : IgnoreRule()

    /**
     * Ignore nodes where nodeType matches but parent type is NOT the excluded type.
     * Used in Ruby: "else" is ignored unless parent is "case" statement.
     */
    data class TypeWhenParentTypeIsNot(val nodeType: String, val requiredParentType: String) : IgnoreRule()

    /**
     * Ignore nodes where first child is an expression_statement with exactly one child.
     * Used for Python RLOC: ignore lines starting with docstrings.
     */
    data object FirstChildIsDocstring : IgnoreRule()
}
