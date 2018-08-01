package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.TaggedSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OopMetricOverviewStrategy

class OopEntryPoint(private val javaCodeTagProvider: JavaCodeTagProvider) {

    fun calculateSingleMetrics(sourceCode: SourceCode): DetailedMetricTable {
        val lineTags = javaCodeTagProvider.getTags(sourceCode)

        val taggedSourceCode = TaggedSourceCode(sourceCode.sourceDescriptor, sourceCode.lines, lineTags)

        return DetailedMetricTable(taggedSourceCode, OopMetricCalculationStrategy(), OopMetricOverviewStrategy())
    }

}