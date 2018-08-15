package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.*
import org.junit.Test


class NoSourceCodeFoundTest {

    @Test
    fun `finds no java file details`() {
        val location = "$end2EndFolder/emptySourceProject/de/oh/no/MoreTest.md"
        val locationResolver = detailedSourceProviderFromResource(location)

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolver)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.LoC] }.isEqualTo(0)
    }

    @Test
    fun `finds no java file overview`() {
        val location = "$end2EndFolder/emptySourceProject"
        val locationResolver = overviewSourceProviderFromResource(location)

        val singleMetrics = calculateOverviewMetricsWithFailOnParseError(locationResolver)

        assertWithPrintOnFail(singleMetrics) { it.languageValue(OopLanguage.JAVA) }.isEqualTo(0)
        assertWithPrintOnFail(singleMetrics) { it.metricValue(OverviewMetricType.LoC) }.isEqualTo(0)
        assertWithPrintOnFail(singleMetrics) { it.metricValue(OverviewMetricType.RLoc) }.isEqualTo(0)
    }

}