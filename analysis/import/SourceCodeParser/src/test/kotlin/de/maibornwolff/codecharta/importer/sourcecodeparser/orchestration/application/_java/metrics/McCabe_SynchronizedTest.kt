package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class McCabe_SynchronizedTest {

    @Test
    fun `synchronized does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(synchronized))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val synchronized = """
public class Foo {
    public void doStuff(){
        synchronized (someObject) {
            doStuff();
        }
    }
}""".lines()


}