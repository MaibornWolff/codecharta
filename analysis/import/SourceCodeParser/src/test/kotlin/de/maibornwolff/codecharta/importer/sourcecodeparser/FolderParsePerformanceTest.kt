package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.calculateMultiMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.GeneratedMultiSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import org.junit.Test

class FolderParsePerformanceTest {

    @Test
    fun `Metrics for many files works and does not crash`() {
        val total2Real1Count = 20
        val total20Real10Count = 20
        val total20Real10Mcc1Nl1Count = 20
        val totalReal = (1 * total2Real1Count) + (10 * total20Real10Count) + (10 * total20Real10Mcc1Nl1Count)
        val locationResolverStub = GeneratedMultiSourceProvider(total2Real1Count, total20Real10Count, total20Real10Mcc1Nl1Count)

        val multiMetrics = calculateMultiMetrics(locationResolverStub)

        assertThatMetricElement(multiMetrics) {it.metricValue(MetricType.RLoc)}.isEqualTo(totalReal)
    }
}