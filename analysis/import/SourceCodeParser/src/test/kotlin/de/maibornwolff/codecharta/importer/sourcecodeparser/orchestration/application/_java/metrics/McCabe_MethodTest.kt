package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class McCabe_MethodTest {

    @Test
    fun `no method means no complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(noMethod))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(0 + 0)
    }

    private val noMethod = """
public class Foo {
    private int bla;
}""".lines()

    @Test
    fun `empty method increments complexity by one`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(emptyMethod))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val emptyMethod = """
public class Foo {
    private int bla;
    public void doStuff(){

    }
}""".lines()

    @Test
    fun `two empty method means complexity by two`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(doubleEmptyMethod))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(2 + 0)
    }

    private val doubleEmptyMethod = """
public class Foo {
    private int bla;
    public void doStuff(){ }
    public void doMoreStuff(){ }
}""".lines()

    @Test
    fun `calling method by name does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(streamWithDoubleColon))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val streamWithDoubleColon = """
public class Foo {
    private int bla;
    public void doStuff(){
        myList
            .stream()
            .map(String::toUpperCase);
    }
}""".lines()

    @Test
    fun `creating a lambda increments complexity because it is the same as a method declaration`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(streamWithLambda))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 1)
    }

    private val streamWithLambda = """
public class Foo {
    private int bla;
    public void doStuff(){
        myList
            .stream()
            .filter(s -> s.startsWith("c"))
            .map(String::toUpperCase);
    }
}""".lines()

    @Test
    fun `creating a long lambda increments complexity because it is the same as a method declaration`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(streamWithLongLambda))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 1)
    }

    private val streamWithLongLambda = """
public class Foo {
    private List<Integer> myList;
    public void doStuff(){
        myList
                .stream()
                .reduce((a, b) -> {
                    return a + b;
                });
    }
}""".lines()


}