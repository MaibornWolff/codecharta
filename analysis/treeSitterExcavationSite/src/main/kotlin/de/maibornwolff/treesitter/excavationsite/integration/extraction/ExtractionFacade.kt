package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.integration.embedded.EmbeddedSourcesFacade
import de.maibornwolff.treesitter.excavationsite.integration.extraction.adapters.LanguageDefinitionExtractionAdapter
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
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
        val grammarLibrary = LanguageRegistry.getGrammarLibrary(language)
        val processedContent = definition.preprocessor?.invoke(content) ?: content
        val extractor = DirectTextExtractor(
            grammar = NativeTreeSitter.grammar(grammarLibrary),
            extractionNodeTypes = LanguageDefinitionExtractionAdapter(definition)
        )
        val embeddedTexts = EmbeddedSourcesFacade.embeddedSources(content, grammarLibrary, definition).flatMap { embedded ->
            extract(embedded.content, embedded.language).map { it.copy(language = embedded.language) }
        }
        return extractor.extract(processedContent) + embeddedTexts
    }
}
