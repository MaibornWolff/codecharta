package de.maibornwolff.treesitter.excavationsite.integration.embedded

import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter

/** Finds the sources in another language a file embeds, see [LanguageDefinition.embeddedSources]. */
object EmbeddedSourcesFacade {
    fun embeddedSources(content: String, grammarLibrary: GrammarLibrary, definition: LanguageDefinition): List<EmbeddedSource> {
        val mapping = definition.embeddedSources ?: return emptyList()
        if (!content.contains(mapping.marker)) return emptyList()
        return FfmSyntaxTree.parse(content, NativeTreeSitter.grammar(grammarLibrary)).use { it.readReleasingReachedNodes(mapping.extract) }
    }
}
