package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateOverviewMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.overviewSourceProviderFromResource
import org.junit.Test


class SourceCodeContainsLotsOfJunkTest {

    @Test
    fun `finds no java file overview`() {
        val location = "$end2EndFolder/junkProject"
        val locationResolver = overviewSourceProviderFromResource(location)

        val singleMetrics = calculateOverviewMetricsWithFailOnParseError(locationResolver)

        assertWithPrintOnFail(singleMetrics) { it.languageValue(OopLanguage.JAVA) }.isEqualTo(1)
        assertWithPrintOnFail(singleMetrics) { it.metricValue(OverviewMetricType.LoC) }.isEqualTo(1)
        assertWithPrintOnFail(singleMetrics) { it.metricValue(OverviewMetricType.RLoc) }.isEqualTo(1)
    }

}