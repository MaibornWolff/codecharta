package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.extraction.ExtractionFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionResult
import java.io.File

/**
 * Main entry point for extracting text from source code using TreeSitter.
 *
 * Extracts identifiers (class names, function names, variables, etc.),
 * comments, and string literals from source code.
 *
 * Usage:
 * ```kotlin
 * // Extract from a file
 * val result = TreeSitterExtraction.extract(File("Main.kt"))
 *
 * // Extract from content with explicit language
 * val result = TreeSitterExtraction.extract("class Foo {}", Language.KOTLIN)
 *
 * // Access extracted items
 * result.identifiers  // List of identifier names
 * result.comments     // List of comment contents
 * result.strings      // List of string literal contents
 *
 * // Check if extraction is supported
 * val hasSupport = TreeSitterExtraction.isExtractionSupported(Language.KOTLIN)
 * ```
 */
object TreeSitterExtraction {
    /**
     * Extracts text from a file.
     *
     * @param file The file to extract from
     * @return ExtractionResult containing all extracted text items
     * @throws IllegalArgumentException if the file extension is not supported
     * @throws UnsupportedOperationException if extraction is not supported for this language
     */
    fun extract(file: File): ExtractionResult {
        val language = Language.fromFilename(file.name)
            ?: throw IllegalArgumentException("Unsupported file extension: ${file.extension}")

        return extract(file.readText(), language)
    }

    /**
     * Extracts text from source code content with an explicit language.
     *
     * @param content The source code to extract from
     * @param language The programming language of the content
     * @return ExtractionResult containing all extracted text items
     * @throws UnsupportedOperationException if extraction is not supported for this language
     */
    fun extract(content: String, language: Language): ExtractionResult {
        if (!isExtractionSupported(language)) {
            throw UnsupportedOperationException(
                "Text extraction is not supported for ${language.name}. " +
                    "Supported languages: ${getSupportedLanguages().joinToString { it.name }}"
            )
        }

        val definition = LanguageRegistry.getLanguageDefinition(language)
        val treeSitterLanguage = LanguageRegistry.getTreeSitterLanguage(language)

        val extractedTexts = ExtractionFacade.extract(
            content = content,
            treeSitterLanguage = treeSitterLanguage,
            definition = definition
        )

        return ExtractionResult(extractedTexts)
    }

    /**
     * Returns whether text extraction is supported for the given language.
     *
     * @param language The language to check
     */
    fun isExtractionSupported(language: Language): Boolean {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        return definition.nodeExtractions.isNotEmpty()
    }

    /**
     * Returns whether text extraction is supported for files with the given extension.
     *
     * @param extension The file extension including the dot (e.g., ".kt")
     */
    fun isExtractionSupported(extension: String): Boolean {
        val language = Language.fromExtension(extension) ?: return false
        return isExtractionSupported(language)
    }

    /**
     * Returns all languages that support text extraction.
     */
    fun getSupportedLanguages(): List<Language> = Language.entries.filter { isExtractionSupported(it) }

    /**
     * Returns all file extensions that support text extraction.
     */
    fun getSupportedExtensions(): Set<String> {
        val extensions = mutableSetOf<String>()
        getSupportedLanguages().forEach { lang ->
            extensions.add(lang.primaryExtension)
            extensions.addAll(lang.otherExtensions)
        }
        return extensions
    }
}
