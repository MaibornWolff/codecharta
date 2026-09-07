package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Unified language definition that combines metrics, extraction, and dependencies.
 *
 * Each language defines simple maps from node types to behaviors.
 * Languages only define what they have - no forced categories.
 *
 * Example usage:
 * ```kotlin
 * object KotlinDefinition : LanguageDefinition {
 *     override val nodeMetrics = mapOf(
 *         "if_expression" to setOf(Metric.LogicComplexity),
 *         "function_declaration" to setOf(Metric.FunctionComplexity, Metric.Function),
 *         "line_comment" to setOf(Metric.CommentLine)
 *     )
 *
 *     override val nodeExtractions = mapOf(
 *         "class_declaration" to Extract.Identifier(single = ExtractionStrategy.FirstChildByType("type_identifier")),
 *         "line_comment" to Extract.Comment(CommentFormats.Line("//"))
 *     )
 * }
 * ```
 */
interface LanguageDefinition :
    MetricMapping,
    ExtractionMapping,
    DependencyMapping {
    /**
     * Language-specific calculation configuration.
     *
     * Used for special cases like Python's indentation-based functions
     * or Ruby's special complexity rules. This declarative config is
     * converted to CalculationExtensions by the metrics adapter.
     */
    val calculationConfig: CalculationConfig
        get() = CalculationConfig()

    /**
     * Optional content preprocessor for composite file formats.
     *
     * When defined, the preprocessor transforms the source content before parsing.
     * This is useful for languages like Vue Single File Components where only
     * a portion of the file (e.g., the <script> section) should be analyzed.
     *
     * @return A function that transforms source content, or null for no preprocessing
     */
    val preprocessor: ((String) -> String)?
        get() = null
}
