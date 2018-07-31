package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class _McCabeIfTest {

    @Test
    fun `if increments complexity by one, else does not count because that is the normal control flow`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(singleIf))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
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

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 3)
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

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
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

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 2)
    }

    private val doubleTernaryOperator = """
public class Foo {
    public void doStuff(){
        Object a = a == null ? b ==  null ? c : d;
    }
}""".lines()


}