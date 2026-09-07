package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Sealed class representing generic extraction patterns.
 *
 * These patterns are language-agnostic and can be reused across
 * different language implementations. Language-specific extraction
 * logic should be implemented as custom extractors, not added here.
 */
sealed class ExtractionStrategy {
    /** Extract the first child matching a single type. */
    data class FirstChildByType(val type: String) : ExtractionStrategy()

    /** Extract the first child matching any of the given types. */
    data class FirstChildByTypes(val types: List<String>) : ExtractionStrategy() {
        constructor(vararg types: String) : this(types.toList())
    }

    /** Find a child by container type, then extract a nested child by target type. */
    data class NestedInChild(val containerType: String, val targetType: String) : ExtractionStrategy()

    /** Extract all children matching a single type (for multi-identifier extraction). */
    data class AllChildrenByType(val type: String) : ExtractionStrategy()
}
