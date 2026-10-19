package de.maibornwolff.treesitter.excavationsite.integration.embedded

import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree

/** Finds the sources in another language a file embeds, see [LanguageDefinition.embeddedSources]. */
internal object EmbeddedSourcesFacade {
    /** Reads them off the syntax tree the metrics or the text extraction parsed [content] into already. */
    fun embeddedSources(tree: FfmSyntaxTree, content: String, definition: LanguageDefinition): List<EmbeddedSource> {
        val mapping = definition.embeddedSources ?: return emptyList()
        if (!content.contains(mapping.marker)) return emptyList()
        return tree.readReleasingReachedNodes(mapping.extract)
    }
}
