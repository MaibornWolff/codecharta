package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.MetricsResult
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import java.io.File

/**
 * Adapter between TreesitterLibrary and CodeCharta's MutableNode format.
 */
object TreeSitterAdapter {
    /**
     * Collects metrics for a file using TreesitterLibrary.
     */
    fun collectMetricsForFile(file: File): MutableNode {
        val fileContent = file.readText()
        return collectMetricsForFile(file, fileContent)
    }

    /**
     * Collects metrics for a file with pre-read content.
     */
    fun collectMetricsForFile(file: File, fileContent: String): MutableNode {
        val language = getLanguageForFile(file)
            ?: throw IllegalArgumentException("Unsupported file extension: ${file.extension}")

        val checksum = ChecksumCalculator.calculateChecksum(fileContent)
        val metricsResult = TreeSitterMetrics.parse(fileContent, language)

        return convertToMutableNode(file.name, metricsResult, checksum)
    }

    /**
     * Collects metrics for content with a specified language.
     */
    fun collectMetrics(fileName: String, fileContent: String, language: Language): MutableNode {
        val checksum = ChecksumCalculator.calculateChecksum(fileContent)
        val metricsResult = TreeSitterMetrics.parse(fileContent, language)

        return convertToMutableNode(fileName, metricsResult, checksum)
    }

    /**
     * Determines the Language for a file based on its extension.
     */
    fun getLanguageForFile(file: File): Language? {
        val extension = "." + file.extension.lowercase()
        return Language.fromExtension(extension)
    }

    private fun convertToMutableNode(fileName: String, result: MetricsResult, checksum: String?): MutableNode {
        val attributes = mutableMapOf<String, Double>()

        // Copy all file-level metrics
        result.metrics.forEach { (name, value) ->
            attributes[name] = value
        }

        // Copy all per-function metrics
        result.perFunctionMetrics.forEach { (name, value) ->
            attributes[name] = value
        }

        return MutableNode(
            name = fileName,
            type = NodeType.File,
            attributes = attributes,
            checksum = checksum
        )
    }
}
