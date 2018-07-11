package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr

class OopEntryPoint {
    fun calculateSingleMetrics(fileSource: SourceCode): SingleMetricTable {
        val taggableLines = TaggableLines(OopLanguage.JAVA, fileSource.lines)

        Antlr.addTags(taggableLines)

        return SingleMetricTable(taggableLines, OopMetricCalculationStrategy())
    }
}