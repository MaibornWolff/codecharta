@file:Suppress("unused")

package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.integration.metrics.MetricsFacade
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricsResult
import java.io.File

/** Re-exported from shared/domain so callers of the public API keep compiling. */
typealias MetricsResult = MetricsResult

object TreeSitterMetrics {
    /** @throws IllegalArgumentException if the file extension is not supported */
    fun parse(file: File): MetricsResult {
        val language = Language.fromFilename(file.name)
            ?: throw IllegalArgumentException("Unsupported file extension: ${file.extension}")

        return parse(file.readText(), language)
    }

    fun parse(content: String, language: Language): MetricsResult = MetricsFacade.parse(content, language)

    /** @param extension including the dot, e.g. ".java" */
    fun isLanguageSupported(extension: String): Boolean = Language.fromExtension(extension) != null

    /** @param extension including the dot, e.g. ".java" */
    fun getLanguage(extension: String): Language? = Language.fromExtension(extension)

    fun getSupportedExtensions(): Set<String> {
        val extensions = mutableSetOf<String>()
        Language.entries.forEach { lang ->
            extensions.add(lang.primaryExtension)
            extensions.addAll(lang.otherExtensions)
        }
        return extensions
    }
}
