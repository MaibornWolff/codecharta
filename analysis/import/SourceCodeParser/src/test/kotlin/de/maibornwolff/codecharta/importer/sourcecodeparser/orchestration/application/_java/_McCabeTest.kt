package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics as calcDetailed
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class _McCabeTest {

    @Test
    fun `empty method increments complexity by one`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(emptyMethod))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 0)
    }

    fun calculateDetailedMetrics(detailedSourceProvider: DetailedSourceProvider): DetailedMetricTable {
        return calcDetailed(detailedSourceProvider)
    }

    @Test
    fun `if increments complexity by one, else does not count because that is the normal control flow`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(singleIf))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
    }

    @Test
    fun `three if conditions increment complexity by three`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(threeIfConditions))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 3)
    }

    @Test
    fun `tenary operator increments complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tenaryOperator))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
    }

    @Test
    fun `double while increments complexity by two`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(doubleWhile))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 2)
    }

    @Test
    fun `single for increments complexity by one`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(singleFor))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
    }

    @Test
    fun `double for increments complexity by two`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(doubleFor))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 2)
    }

    @Test
    fun `try does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryWithoutCatch))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 0)
    }

    @Test
    fun `only catch increments complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryWithOneCatch))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 1)
    }

    @Test
    fun `Each catch increments complexity by one`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(tryWithTwoCatch))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 2)
    }

    @Test
    fun `empty switch does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(emptySwitch))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 0)
    }

    @Test
    fun `synchronized does not increment complexity`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(synchronized))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.MCC] }.isEqualTo(1 + 0)
    }

    private val emptyMethod =
"""
public class Foo {
    private int bla;
    public void doStuff(){

    }
}""".lines()

    private val singleIf =
"""
public class Foo {
    public void doStuff(){
        if(a == null){
            doOther();
        } else {
            doBetter();
        }
    }
}""".lines()


    private val threeIfConditions =
            """
public class Foo {
    public void doStuff(){
        if(a == null || b == null && c != null){
            doOther();
        }
    }
}""".lines()

    private val doubleWhile =
            """
public class Foo {
    public void doStuff(){
        while(a == null){while(a == null){
            doOther();
        }}
    }
}""".lines()

    private val singleFor =
"""
public class Foo {
    public void doStuff(){
        for(int i = 0; i < 5; i++){
            doOther();
        }
    }
}""".lines()

    private val doubleFor =
"""
public class Foo {
    public void doStuff(){
        for(Foo f: bar){
            for(int i = 0; i < 5; i++){
                doOther();
            }
        }
    }
}""".lines()

    private val tenaryOperator =
"""
public class Foo {
    public void doStuff(){
        Object a = a == null ? b : c;
    }
}""".lines()

    private val tryWithoutCatch =
            """
public class Foo {
    public void doStuff(){
        try(Database db = createDb()){
            db.doStuff();
        }
    }
}""".lines()

    private val tryWithOneCatch =
"""
public class Foo {
    public void doStuff(){
        try(Database db = createDb()){
            db.doStuff();
        }catch(IOException io){
            System.out.println("Db Broke");
        }
    }
}""".lines()

    private val tryWithTwoCatch =
"""
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

    private val emptySwitch =
        """
public class Foo {
    public void doStuff(){
        switch (""){

        }
    }
}""".lines()

    private val synchronized =
"""
public class Foo {
    public void doStuff(){
        synchronized (someObject) {
            doStuff();
        }
    }
}""".lines()


}