package de.maibornwolff.treesitter.excavationsite.shared.domain

sealed class IgnoreRule {
    data class TypeWithParentType(val nodeType: String, val parentType: String) : IgnoreRule()

    data class TypeInSet(val types: Set<String>) : IgnoreRule()

    /** Keeps Ruby from counting an `if` nested directly in an `if` twice. */
    data class TypeEqualsParentTypeWhenInSet(val types: Set<String>) : IgnoreRule()

    /** A Python string that is the only child of its parent is a docstring. */
    data class SingleChildOfParentWithType(val nodeType: String) : IgnoreRule()

    data class TypeWhenParentTypeIsNot(val nodeType: String, val requiredParentType: String) : IgnoreRule()

    /** Matches when the first child is an expression_statement with exactly one child, as a Python docstring is. */
    data object FirstChildIsDocstring : IgnoreRule()
}
