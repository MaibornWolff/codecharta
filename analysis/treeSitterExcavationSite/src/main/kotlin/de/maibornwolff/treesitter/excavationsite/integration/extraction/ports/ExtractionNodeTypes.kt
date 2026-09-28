package de.maibornwolff.treesitter.excavationsite.integration.extraction.ports

import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Port interface for extraction node type configuration.
 *
 * This interface abstracts the extraction configuration needed by the extraction feature,
 * allowing different implementations to provide node-to-extraction mappings.
 */
interface ExtractionNodeTypes {
    /**
     * Maps node types to their extraction behavior.
     *
     * Each node type can have one extraction behavior (identifier, comment, or string).
     */
    val nodeExtractions: Map<String, Extract>

    /**
     * Pre-computed comment formats by node type.
     * Used by CommentExtractor for efficient lookup.
     */
    val commentFormats: Map<String, CommentFormats>

    /**
     * Pre-computed string formats by node type.
     * Used by StringExtractor for efficient lookup.
     */
    val stringFormats: Map<String, StringFormats>
}
