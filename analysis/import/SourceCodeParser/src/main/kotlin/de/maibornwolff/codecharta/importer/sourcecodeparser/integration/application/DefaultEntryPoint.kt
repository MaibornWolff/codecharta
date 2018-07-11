package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.metrics.DefaultMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.source.DefaultLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): DetailedMetricTable{
        return DetailedMetricTable(TaggableLines(DefaultLanguage.NONE_FOUND, emptyList()), DefaultMetricCalculationStrategy())
    }
}