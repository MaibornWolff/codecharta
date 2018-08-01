package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class TypeInferenceTest {

    @Test
    fun `example has correct rloc count`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(16)
    }

    private val code =
            """package none;
public class TypeInference {

    public void doStuff(){
        var list = new ArrayList<String>();
        var stream = getStream();
    }

    public void count(){
        var numbers = List.of(1, 2, 3, 4, 5); // inferred value ArrayList<String>
        for (var number : numbers) {
            System.out.println(number);
        }

        for (var i = 0; i < numbers.size(); i++) {
            System.out.println(numbers.get(i));
        }
    }
}""".lines()
}

