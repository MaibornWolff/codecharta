package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr

class OopEntryPoint {
    fun calculateSingleMetrics(fileSource: SourceCode): DetailedMetricTable {
        val taggableLines = TaggableLines(OopLanguage.JAVA, fileSource.lines)

        Antlr.addTags(taggableLines)

        return DetailedMetricTable(taggableLines, OopMetricCalculationStrategy())
    }
}