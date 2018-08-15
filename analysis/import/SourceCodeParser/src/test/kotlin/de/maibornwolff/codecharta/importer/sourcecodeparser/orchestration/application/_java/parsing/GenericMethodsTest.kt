package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class GenericMethodsTest {

    @Test
    fun annotation_example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(12)
    }

    private val code =
            """/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

class Mapper {
    // The class itself is not generic, the constructor is
    <T, V> Mapper(T array, V item) {
    }

    /* This method will accept only arrays of the same type as
    the searched item type or its subtype*/
    static <T, V extends T> boolean contains(T item, V[] arr) {
        for (T currentItem : arr) {
            if (item.equals(currentItem)) {
                return true;
            }
        }
        return false;
    }
}""".lines()
}