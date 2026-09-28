package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Rust language definition.
 *
 * Rust supports code metrics, text extraction, and dependency analysis.
 */
object RustDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = RustMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = RustExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = RustDependencyMapping.dependencyMapping

    // ========== Calculation Configuration ==========

    /**
     * Unlike most grammars, tree-sitter-rust's `line_comment`/`block_comment` nodes are not leaves:
     * they expose child tokens (`//`, `/*`, `*/`, `doc_comment`, and the doc-comment markers). The
     * RLOC calculator skips the comment node itself but would otherwise count these inner tokens as
     * real code lines. They are ignored here so comments never inflate RLOC.
     *
     * The marker tokens `!` (`//!`) and `/` (`///`) collide with the negation and division operators,
     * so they are matched by parent type to avoid suppressing real code.
     */
    private val commentTokenTypes = setOf(
        "//",
        "/*",
        "*/",
        "doc_comment",
        "inner_doc_comment_marker",
        "outer_doc_comment_marker"
    )

    override val calculationConfig = CalculationConfig(
        ignoreForRloc = listOf(
            IgnoreRule.TypeInSet(commentTokenTypes),
            IgnoreRule.TypeWithParentType("!", "inner_doc_comment_marker"),
            IgnoreRule.TypeWithParentType("/", "outer_doc_comment_marker")
        )
    )
}
