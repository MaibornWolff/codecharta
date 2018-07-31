package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class DefaultInterfaceMethodTest {

    @Test
    fun annotation_example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.RLoc] }.isEqualTo(6)
    }

    private val code =
"""/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne8.java
 */

// Default interface method
interface Formula {
    double calculate(int a);

    default double sqrt(int a) {
        return Math.sqrt(a);
    }
}""".trim().lines()
}