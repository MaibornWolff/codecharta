package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import io.github.treesitter.metrics.api.Language
import io.github.treesitter.metrics.api.TreeSitterMetrics
import java.io.File

/**
 * MetricCollector that delegates to the TreeSitter Metrics Library.
 * Subclasses only need to specify which language they handle.
 */
abstract class MetricCollector {
    /**
     * Subclasses must provide the Language enum value that corresponds
     * to their TreeSitter language for delegation to the library.
     */
    protected abstract val language: Language

    fun collectMetricsForFile(file: File): MutableNode {
        val fileContent = file.readText()
        return collectMetricsForFile(file, fileContent)
    }

    fun collectMetricsForFile(file: File, fileContent: String): MutableNode {
        val checksum = ChecksumCalculator.calculateChecksum(fileContent)

        // Delegate to the TreeSitter Metrics Library
        val result = TreeSitterMetrics.parse(fileContent, language)

        // Combine file metrics and per-function metrics
        val allMetrics = mutableMapOf<String, Double>()
        allMetrics.putAll(result.metrics)
        allMetrics.putAll(result.perFunctionMetrics)

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = allMetrics,
            checksum = checksum
        )
    }
}
