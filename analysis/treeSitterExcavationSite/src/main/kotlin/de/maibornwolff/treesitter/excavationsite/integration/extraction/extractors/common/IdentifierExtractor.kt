package de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common

import de.maibornwolff.treesitter.excavationsite.integration.extraction.ExtractionExecutor
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import org.treesitter.TSNode

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
    private val customSingleExtractors: Map<String, (TSNode, String) -> String?> = emptyMap(),
    private val customMultiExtractors: Map<String, (TSNode, String) -> List<String>> = emptyMap()
) {
    /**
     * Extracts a single identifier from a node.
     *
     * Priority: custom extractors > method extractors
     */
    fun extractSingle(node: TSNode, sourceCode: String): String? {
        val nodeType = node.type

        customSingleExtractors[nodeType]?.let { extractor ->
            return extractor(node, sourceCode)
        }

        singleExtractors[nodeType]?.let { method ->
            return ExtractionExecutor.extractSingle(node, sourceCode, method)
        }

        return null
    }

    /**
     * Extracts multiple identifiers from a node.
     *
     * Priority: custom multi extractors > multi method extractors > single extraction
     */
    fun extractMultiple(node: TSNode, sourceCode: String): List<String> {
        val nodeType = node.type

        customMultiExtractors[nodeType]?.let { extractor ->
            return extractor(node, sourceCode)
        }

        multiExtractors[nodeType]?.let { method ->
            return ExtractionExecutor.extractMultiple(node, sourceCode, method)
        }

        return listOfNotNull(extractSingle(node, sourceCode))
    }
}
