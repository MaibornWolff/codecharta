package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class SwitchCaseTest {

    @Test
    fun example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(18)
    }

    private val code =
            """/*
 * From https://docs.oracle.com/javase/tutorial/java/nutsandbolts/switch.html
 */
public class Foo {

    public static void main(String[] args) {
        java.util.ArrayList<String> futureMonths =
                new java.util.ArrayList<String>();

        int month = 8;
        switch (month) {
            case 1:
                futureMonths.add("January");
            case 2:
                futureMonths.add("February");
                break;
            case 12:
                futureMonths.add("December");
            default:
                break;
        }
    }
}""".lines()
}