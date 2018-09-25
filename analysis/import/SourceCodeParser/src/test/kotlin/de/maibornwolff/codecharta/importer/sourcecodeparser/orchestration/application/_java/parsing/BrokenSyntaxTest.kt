package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithIgnoreParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class BrokenSyntaxTest {

    @Test
    fun `broken syntax still produces correct real lines of code`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithIgnoreParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(7)
    }

    @Test
    fun `broken syntax produces complexity of 3`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithIgnoreParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(1 + 2)
    }

    private val code =
            """package none;

public class Foo {

    public Blub getStuff(){
        if(true) {
            for(int i = 0; i < 5; i++){
                return getPrice() - 1f + getTax();
        return null;
""".lines()
}