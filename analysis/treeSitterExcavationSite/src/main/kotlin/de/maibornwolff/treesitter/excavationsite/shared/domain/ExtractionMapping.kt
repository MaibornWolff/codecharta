package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Interface for language-specific extraction definitions.
 *
 * Maps AST node types to their extraction behavior.
 */
interface ExtractionMapping {
    /**
     * Maps node types to their extraction behavior.
     *
     * Each node type can have one extraction behavior (identifier, comment, or string).
     */
    val nodeExtractions: Map<String, Extract>

    /** Text that the grammar splits into runs of sibling nodes, read once per run; the node types of a run need no entry in [nodeExtractions]. */
    val textRun: TextRun?
        get() = null
}
