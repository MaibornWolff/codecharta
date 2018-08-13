package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.detailedSourceProviderFromResource
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.javaApplicationFolder
import org.junit.Test
import java.io.IOException

class HelloWorldTest {

    @Test
    @Throws(IOException::class)
    fun `example has correct real lines of code`() {
        val resource = "$javaApplicationFolder/HelloWorld.java"
        val locationResolverStub = detailedSourceProviderFromResource(resource)

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(133)
    }

    @Test
    @Throws(IOException::class)
    fun `example has correct McCabe`() {
        val resource = "$javaApplicationFolder/HelloWorld.java"
        val locationResolverStub = detailedSourceProviderFromResource(resource)

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(29)

    }

}