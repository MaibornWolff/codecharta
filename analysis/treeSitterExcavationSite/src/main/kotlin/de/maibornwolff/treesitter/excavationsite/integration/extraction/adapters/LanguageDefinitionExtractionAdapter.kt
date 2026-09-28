package de.maibornwolff.treesitter.excavationsite.integration.extraction.adapters

import de.maibornwolff.treesitter.excavationsite.integration.extraction.ports.ExtractionNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Adapts a LanguageDefinition to the ExtractionNodeTypes interface.
 *
 * Extracts and pre-computes the format maps needed by extractors from the
 * language definition's nodeExtractions map.
 */
class LanguageDefinitionExtractionAdapter(definition: LanguageDefinition) : ExtractionNodeTypes {
    override val nodeExtractions: Map<String, Extract> = definition.nodeExtractions

    override val commentFormats: Map<String, CommentFormats> = definition.nodeExtractions
        .mapNotNull { (nodeType, extract) ->
            when (extract) {
                is Extract.Comment -> extract.format?.let { nodeType to it }
                else -> null
            }
        }.toMap()

    override val stringFormats: Map<String, StringFormats> = definition.nodeExtractions
        .mapNotNull { (nodeType, extract) ->
            when (extract) {
                is Extract.StringLiteral -> extract.format?.let { nodeType to it }
                else -> null
            }
        }.toMap()
}
