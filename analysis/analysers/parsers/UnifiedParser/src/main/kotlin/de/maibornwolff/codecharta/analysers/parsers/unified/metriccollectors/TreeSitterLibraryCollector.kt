package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.util.SourceText
import de.maibornwolff.treesitter.excavationsite.api.Language
import java.io.File

/**
 * A metric collector that uses TreesitterLibrary for metric calculation.
 * Replaces all language-specific collectors with a single unified implementation.
 */
class TreeSitterLibraryCollector(private val language: Language) {
    fun collectMetricsForFile(file: File): MutableNode = TreeSitterAdapter.collectMetrics(file.name, SourceText.read(file), language)

    fun collectMetricsForFile(file: File, fileContent: String): MutableNode =
        TreeSitterAdapter.collectMetrics(file.name, fileContent, language)
}
