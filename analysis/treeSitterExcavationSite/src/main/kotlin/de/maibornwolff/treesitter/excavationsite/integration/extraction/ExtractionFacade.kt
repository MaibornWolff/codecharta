package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.integration.embedded.EmbeddedSourcesFacade
import de.maibornwolff.treesitter.excavationsite.integration.extraction.adapters.LanguageDefinitionExtractionAdapter
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter

/**
 * Public entry point for the extraction feature.
 *
 * This facade provides the interface for extracting text from source code.
 * It adapts LanguageDefinition to the internal ExtractionNodeTypes port.
 */
object ExtractionFacade {
    /**
     * Extracts text from the given source code, together with the texts of the sources in another language it embeds,
     * which are marked with their language.
     *
     * @param content The source code to extract from
     * @param language The language of the content
     * @return A list of extracted text items
     */
    fun extract(content: String, language: Language): List<ExtractedText> {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        definition.composer?.let { compose -> return textsOf(compose(content)) }
        val grammarLibrary = LanguageRegistry.getGrammarLibrary(language)
        val processedContent = definition.preprocessor?.invoke(content) ?: content
        if (processedContent.isBlank()) return emptyList()
        val extractor = DirectTextExtractor(LanguageDefinitionExtractionAdapter(definition))
        return FfmSyntaxTree.parse(processedContent, NativeTreeSitter.grammar(grammarLibrary)).use { tree ->
            extractor.extract(tree) + textsOfParts(EmbeddedSourcesFacade.embeddedSources(tree, processedContent, definition))
        }
    }

    private fun textsOf(composed: ComposedSource): List<ExtractedText> = composed.texts + textsOfParts(composed.allParts)

    private fun textsOfParts(parts: List<EmbeddedSource>): List<ExtractedText> =
        parts.flatMap { part -> extract(part.content, part.language).map { it.copy(language = part.language) } }
}
