package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.EndlessResolver
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.FolderPrinterSpy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import org.junit.Test

class FolderParsePerformanceTest {

    @Test
    fun tabular_output_for_many_small_files_does_work() {
        val total2Real1Count = 20
        val total20Real10Count = 20
        val total20Real10Mcc1Nl1Count = 20
        val locationResolverStub = EndlessResolver(total2Real1Count, total20Real10Count, total20Real10Mcc1Nl1Count)
        val printerSpy = FolderPrinterSpy()

        SourceApp(locationResolverStub, printerSpy).printMetrics(listOf("file name does not matter"))

        assertThatMetricElement(printerSpy.printedFolderMetrics!!)
            {it.metricValue(MetricType.RLoc)}.isEqualTo( (1 * total2Real1Count) + (10 * total20Real10Count) + (10 * total20Real10Mcc1Nl1Count))
    }
}