package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class McCabe_ThrowTest {

    @Test
    fun `try does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryWithoutCatch))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val tryWithoutCatch = """
public class Foo {
    public void doStuff(){
        try(Database db = createDb()){
            db.doStuff();
        }
    }
}""".lines()

    @Test
    fun `finally does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryFinally))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val tryFinally = """
public class Foo {
    public void doStuff(){
        try(Database db = createDb()){
            db.doStuff();
        }finally {
            db.cleanup();
        }
    }
}""".lines()

    @Test
    fun `only catch increments complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryWithOneCatch))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 1)
    }

    private val tryWithOneCatch = """
public class Foo {
    public void doStuff(){
        try(Database db = createDb()){
            db.doStuff();
        }catch(IOException io){
            System.out.println("Db Broke");
        }
    }
}""".lines()

    @Test
    fun `Each catch increments complexity by one`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryWithTwoCatch))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 2)
    }

    private val tryWithTwoCatch = """
public class Foo {
    public void doStuff(){
        try(Database db = createDb()){
            db.doStuff();
        }catch(IOException io){
            System.out.println("Db Broke");
        }catch(Exception io){
            System.out.println("Db Broke");
        }
    }
}""".lines()


}