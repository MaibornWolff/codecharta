package de.maibornwolff.codecharta.importer.sourcecodeparser.performance_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateOverviewMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.GeneratedOverviewSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import org.junit.Test

class FolderParsePerformanceTest {

    @Test
    fun `Metrics for many files works and does not crash`() {
        val total2Real1Count = 20
        val total20Real10Count = 20
        val total20Real10Mcc1Nl1Count = 20
        val totalReal = (1 * total2Real1Count) + (10 * total20Real10Count) + (10 * total20Real10Mcc1Nl1Count)
        val locationResolverStub = GeneratedOverviewSourceProvider(total2Real1Count, total20Real10Count, total20Real10Mcc1Nl1Count)

        val multiMetrics = calculateOverviewMetrics(locationResolverStub)

        assertWithPrintOnFail(multiMetrics) { it.metricValue(MetricType.RLoc) }.isEqualTo(totalReal)
    }
}