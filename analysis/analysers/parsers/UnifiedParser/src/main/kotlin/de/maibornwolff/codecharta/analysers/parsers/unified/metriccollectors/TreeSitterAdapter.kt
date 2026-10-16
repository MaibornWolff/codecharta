package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.util.FileExtension
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.MetricsResult
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import java.io.File

/**
 * Adapter between TreesitterLibrary and CodeCharta's MutableNode format.
 */
object TreeSitterAdapter {
    private val languageByExtension: Map<FileExtension, Language> = mapOf(
        FileExtension.JAVA to Language.JAVA,
        FileExtension.KOTLIN to Language.KOTLIN,
        FileExtension.TYPESCRIPT to Language.TYPESCRIPT,
        FileExtension.TSX to Language.TSX,
        FileExtension.JAVASCRIPT to Language.JAVASCRIPT,
        FileExtension.PYTHON to Language.PYTHON,
        FileExtension.GO to Language.GO,
        FileExtension.PHP to Language.PHP,
        FileExtension.RUBY to Language.RUBY,
        FileExtension.SWIFT to Language.SWIFT,
        FileExtension.BASH to Language.BASH,
        FileExtension.CSHARP to Language.CSHARP,
        FileExtension.CPP to Language.CPP,
        FileExtension.C to Language.C,
        FileExtension.OBJECTIVE_C to Language.OBJECTIVE_C,
        FileExtension.VUE to Language.VUE,
        FileExtension.DELPHI to Language.DELPHI,
        FileExtension.RUST to Language.RUST,
        FileExtension.HTML to Language.ANGULAR,
        FileExtension.SQL to Language.SQL
    )

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
     * Maps a FileExtension to TreesitterLibrary's Language enum.
     */
    fun getLanguageForExtension(fileExtension: FileExtension): Language? = languageByExtension[fileExtension]

    /**
     * Determines the Language for a file based on its extension.
     */
    fun getLanguageForFile(file: File): Language? {
        val extension = "." + file.extension.lowercase()
        return Language.fromExtension(extension)
    }

    /**
     * Checks if a file extension is supported by TreesitterLibrary.
     */
    fun isSupported(fileExtension: FileExtension): Boolean = getLanguageForExtension(fileExtension) != null

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
