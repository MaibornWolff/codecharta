package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.TaggedSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.AntlrEntryPoint

class OopEntryPoint {
    fun calculateSingleMetrics(sourceCode: SourceCode): DetailedMetricTable {
        val lineTags = AntlrEntryPoint.addTags(sourceCode)

        val taggedSourceCode = TaggedSourceCode(sourceCode.sourceDescriptor, sourceCode.lines, lineTags)

        return DetailedMetricTable(taggedSourceCode, OopMetricCalculationStrategy())
    }
}