package de.maibornwolff.codecharta.importer.sourcecodeparser.performance_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.GeneratedOverviewSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateOverviewMetricsWithFailOnParseError
import org.junit.Test

class FolderParsePerformanceTest {

    @Test
    fun `Metrics for many files works and does not crash`() {
        val total2Real2Count = 20
        val total20Real13Count = 20
        val total20Real14Mcc1Nl1Count = 20
        val totalReal = (2 * total2Real2Count) + (13 * total20Real13Count) + (14 * total20Real14Mcc1Nl1Count)
        val locationResolverStub = GeneratedOverviewSourceProvider(total2Real2Count, total20Real13Count, total20Real14Mcc1Nl1Count)

        val multiMetrics = calculateOverviewMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(multiMetrics) { it.metricValue(OverviewMetricType.RLoc) }.isEqualTo(totalReal)
    }
}