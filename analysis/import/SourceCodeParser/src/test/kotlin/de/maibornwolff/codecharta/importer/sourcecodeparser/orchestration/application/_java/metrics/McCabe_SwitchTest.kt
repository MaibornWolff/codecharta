package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class McCabe_SwitchTest {

    @Test
    fun `empty switch does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(emptySwitch))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val emptySwitch = """
public class Foo {
    public void doStuff(){
        switch (aString){

        }
    }
}""".lines()

    @Test
    fun `each case increments complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(doubleSwitchCase))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 2)
    }

    private val doubleSwitchCase = """
public class Foo {
    public void doStuff(){
        switch (aString){
            case "1":
                foo();
                break;
            case "2":
                bar();
        }
    }
}""".lines()

    @Test
    fun `default does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(switchDefaultCase))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val switchDefaultCase = """
public class Foo {
    public void doStuff(){
        switch (aString){
            default:
                bar();
        }
    }
}""".lines()


}