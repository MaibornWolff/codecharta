package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr

class OopEntryPoint {
    fun calculateSingleMetrics(fileSource: SourceCode): DetailedMetricTable {
        val taggableSourceCode = TaggableSourceCode(fileSource.sourceDescriptor, fileSource.lines)

        Antlr.addTags(taggableSourceCode)

        return DetailedMetricTable(taggableSourceCode, OopMetricCalculationStrategy())
    }
}