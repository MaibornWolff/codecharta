package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.metrics.DefaultMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.source.DefaultLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): SingleMetricTable{
        return SingleMetricTable(TaggableLines(DefaultLanguage.NONE_FOUND, emptyList()), DefaultMetricCalculationStrategy())
    }
}