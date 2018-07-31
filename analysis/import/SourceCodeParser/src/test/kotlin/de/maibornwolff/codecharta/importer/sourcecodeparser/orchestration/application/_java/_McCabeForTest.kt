package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class _McCabeForTest {


    @Test
    fun `single for increments complexity by one`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(singleFor))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
    }

    private val singleFor = """
public class Foo {
    public void doStuff(){
        for(int i = 0; i < 5; i++){
            doOther();
        }
    }
}""".lines()

    @Test
    fun `double for increments complexity by two`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(doubleFor))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 2)
    }

    private val doubleFor = """
public class Foo {
    public void doStuff(){
        for(Foo f: bar){
            for(int i = 0; i < 5; i++){
                doOther();
            }
        }
    }
}""".lines()


}