package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.extraction.ExtractionFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionResult
import java.io.File

/** Extracts identifiers, comments and string literals from source code. */
object TreeSitterExtraction {
    /**
     * @throws IllegalArgumentException if the file extension is not supported
     * @throws UnsupportedOperationException if extraction is not supported for this language
     */
    fun extract(file: File): ExtractionResult {
        val language = Language.fromFilename(file.name)
            ?: throw IllegalArgumentException("Unsupported file extension: ${file.extension}")

        return extract(file.readText(), language)
    }

    /** @throws UnsupportedOperationException if extraction is not supported for [language] */
    fun extract(content: String, language: Language): ExtractionResult {
        if (!isExtractionSupported(language)) {
            throw UnsupportedOperationException(
                "Text extraction is not supported for ${language.name}. " +
                    "Supported languages: ${getSupportedLanguages().joinToString { it.name }}"
            )
        }

        return ExtractionResult(ExtractionFacade.extract(content, language))
    }

    fun isExtractionSupported(language: Language): Boolean {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        return definition.nodeExtractions.isNotEmpty()
    }

    /** @param extension including the dot, e.g. ".kt" */
    fun isExtractionSupported(extension: String): Boolean {
        val language = Language.fromExtension(extension) ?: return false
        return isExtractionSupported(language)
    }

    fun getSupportedLanguages(): List<Language> = Language.entries.filter { isExtractionSupported(it) }

    fun getSupportedExtensions(): Set<String> {
        val extensions = mutableSetOf<String>()
        getSupportedLanguages().forEach { lang ->
            extensions.add(lang.primaryExtension)
            extensions.addAll(lang.otherExtensions)
        }
        return extensions
    }
}
