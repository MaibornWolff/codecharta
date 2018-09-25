package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class SuperExceptionTest {

    @Test
    fun `example has correct real lines of code`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(12)
    }

    private val code = """
package somehwere.over.the.rainbow;

public class InvalidInputParameterException extends RuntimeException {

    public InvalidInputParameterException(Exception e) {
        super(e);
    }

    public InvalidInputParameterException(String message) {
        super(message);
    }

    public InvalidInputParameterException(Exception e, String message) {
        super(e, message);
    }

}
""".lines()
}