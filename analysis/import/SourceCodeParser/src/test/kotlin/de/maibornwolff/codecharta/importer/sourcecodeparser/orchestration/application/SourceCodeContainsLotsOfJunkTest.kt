package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.*
import org.junit.Test


class SourceCodeContainsLotsOfJunkTest {

    @Test
    fun `finds no java file overview`() {
        val location = "$end2EndFolder/junkProject"
        val locationResolver = overviewSourceProviderFromResource(location)

        val singleMetrics = calculateOverviewMetrics(locationResolver)

        assertWithPrintOnFail(singleMetrics) {it.languageValue(OopLanguage.JAVA)}.isEqualTo(1)
        assertWithPrintOnFail(singleMetrics) {it.metricValue(MetricType.LoC)}.isEqualTo(1)
        assertWithPrintOnFail(singleMetrics) {it.metricValue(MetricType.RLoc)}.isEqualTo(1)
    }

}