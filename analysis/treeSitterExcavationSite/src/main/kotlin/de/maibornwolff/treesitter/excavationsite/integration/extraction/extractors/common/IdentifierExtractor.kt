package de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common

import de.maibornwolff.treesitter.excavationsite.integration.extraction.ExtractionExecutor
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Generic identifier extractor that combines method-based and custom extraction.
 *
 * Custom extractors take priority over method extractors, allowing languages
 * to override generic patterns with specialized logic when needed.
 *
 * @param singleExtractors Generic extraction methods for single identifiers
 * @param multiExtractors Generic extraction methods for multiple identifiers
 * @param customSingleExtractors Language-specific functions for single identifiers
 * @param customMultiExtractors Language-specific functions for multiple identifiers
 */
class IdentifierExtractor(
    private val singleExtractors: Map<String, ExtractionStrategy> = emptyMap(),
    private val multiExtractors: Map<String, ExtractionStrategy> = emptyMap(),
    private val customSingleExtractors: Map<String, (SyntaxNode) -> String?> = emptyMap(),
    private val customMultiExtractors: Map<String, (SyntaxNode) -> List<String>> = emptyMap()
) {
    /**
     * Extracts a single identifier from a node.
     *
     * Priority: custom extractors > method extractors
     */
    fun extractSingle(node: SyntaxNode): String? {
        val nodeType = node.type

        customSingleExtractors[nodeType]?.let { extractor ->
            return extractor(node)
        }

        singleExtractors[nodeType]?.let { method ->
            return ExtractionExecutor.extractSingle(node, method)
        }

        return null
    }

    /**
     * Extracts multiple identifiers from a node.
     *
     * Priority: custom multi extractors > multi method extractors > single extraction
     */
    fun extractMultiple(node: SyntaxNode): List<String> {
        val nodeType = node.type

        customMultiExtractors[nodeType]?.let { extractor ->
            return extractor(node)
        }

        multiExtractors[nodeType]?.let { method ->
            return ExtractionExecutor.extractMultiple(node, method)
        }

        return listOfNotNull(extractSingle(node))
    }
}
