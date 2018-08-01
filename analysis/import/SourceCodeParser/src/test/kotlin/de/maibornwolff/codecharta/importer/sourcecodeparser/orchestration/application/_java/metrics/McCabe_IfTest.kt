package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class McCabe_IfTest {

    @Test
    fun `if increments complexity by one, else does not count because that is the normal control flow`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(singleIf))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 1)
    }

    private val singleIf = """
public class Foo {
    public void doStuff(){
        if(a == null){
            doOther();
        } else {
            doBetter();
        }
    }
}""".lines()

    @Test
    fun `three if conditions increment complexity by three`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(threeIfConditions))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 3)
    }

    private val threeIfConditions = """
public class Foo {
    public void doStuff(){
        if(a == null || b == null && c != null){
            doOther();
        }
    }
}""".lines()

    @Test
    fun `ternary operator increments complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(ternaryOperator))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 1)
    }

    private val ternaryOperator = """
public class Foo {
    public void doStuff(){
        Object a = a == null ? b : c;
    }
}""".lines()

    @Test
    fun `two ternary operators increments complexity by two`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(doubleTernaryOperator))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 2)
    }

    private val doubleTernaryOperator = """
public class Foo {
    private Object a, b, c, d, e;
    public void doStuff(){
        Object z = a == null ? (b ==  null ? c : d) : e;
    }
}""".lines()


}