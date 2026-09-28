package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Interface for language-specific metric definitions.
 *
 * Maps AST node types to the metrics they contribute to.
 */
interface MetricMapping {
    /**
     * Maps node types to their metric contributions.
     *
     * A node can contribute to multiple metrics (e.g., function_declaration
     * contributes to both FunctionComplexity and Function).
     */
    val nodeMetrics: Map<String, Set<Metric>>
}
