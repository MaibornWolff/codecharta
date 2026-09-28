@file:Suppress("unused")

package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.metrics.MetricsFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricsResult
import java.io.File

/**
 * Re-export MetricsResult from shared/domain for public API backward compatibility.
 */
typealias MetricsResult = MetricsResult

/**
 * Main entry point for calculating code metrics using TreeSitter.
 *
 * Usage:
 * ```kotlin
 * // Parse a file
 * val result = TreeSitterMetrics.parse(File("Main.java"))
 *
 * // Parse content with explicit language
 * val result = TreeSitterMetrics.parse("class Foo {}", Language.JAVA)
 *
 * // Check if language is supported
 * val isSupported = TreeSitterMetrics.isLanguageSupported(".kt")
 * ```
 */
object TreeSitterMetrics {
    /**
     * Parses a file and returns its code metrics.
     *
     * @param file The file to parse
     * @return MetricsResult containing all calculated metrics
     * @throws IllegalArgumentException if the file extension is not supported
     */
    fun parse(file: File): MetricsResult {
        val language = Language.fromFilename(file.name)
            ?: throw IllegalArgumentException("Unsupported file extension: ${file.extension}")

        return parse(file.readText(), language)
    }

    /**
     * Parses source code content with an explicit language.
     *
     * @param content The source code to parse
     * @param language The programming language of the content
     * @return MetricsResult containing all calculated metrics
     */
    fun parse(content: String, language: Language): MetricsResult {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        val treeSitterLanguage = LanguageRegistry.getTreeSitterLanguage(language)

        val metrics = MetricsFacade.collectMetrics(
            content = content,
            treeSitterLanguage = treeSitterLanguage,
            definition = definition
        )

        return toMetricsResult(metrics)
    }

    private fun toMetricsResult(metrics: Map<String, Double>): MetricsResult {
        val perFunctionMetrics = metrics.filterKeys { key ->
            key.endsWith("_per_function")
        }

        val fileMetrics = metrics.filterKeys { key ->
            !key.endsWith("_per_function")
        }

        return MetricsResult(
            metrics = fileMetrics,
            perFunctionMetrics = perFunctionMetrics
        )
    }

    /**
     * Returns whether the given file extension is supported.
     *
     * @param extension The file extension including the dot (e.g., ".java")
     */
    fun isLanguageSupported(extension: String): Boolean = Language.fromExtension(extension) != null

    /**
     * Returns the language for the given file extension, or null if not supported.
     *
     * @param extension The file extension including the dot (e.g., ".java")
     */
    fun getLanguage(extension: String): Language? = Language.fromExtension(extension)

    /**
     * Returns all supported file extensions.
     */
    fun getSupportedExtensions(): Set<String> {
        val extensions = mutableSetOf<String>()
        Language.entries.forEach { lang ->
            extensions.add(lang.primaryExtension)
            extensions.addAll(lang.otherExtensions)
        }
        return extensions
    }
}
