package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.treesitter.excavationsite.api.Language
import java.io.File

/**
 * A metric collector that uses TreesitterLibrary for metric calculation.
 * Replaces all language-specific collectors with a single unified implementation.
 */
class TreeSitterLibraryCollector(
    private val language: Language
) {
    fun collectMetricsForFile(file: File): MutableNode {
        return TreeSitterAdapter.collectMetrics(file.name, file.readText(), language)
    }

    fun collectMetricsForFile(file: File, fileContent: String): MutableNode {
        return TreeSitterAdapter.collectMetrics(file.name, fileContent, language)
    }
}
