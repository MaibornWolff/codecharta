package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class GenericClassTest {

    @Test
    fun annotation_example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(9)
    }

    private val code =
            """/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

/* This class has two type variables, T and V. T must be
a subtype of ArrayList and implement Formattable interface */
public class Mapper<T extends ArrayList & Formattable, V> {
    public void add(T array, V item) {
        // array has add method because it is an ArrayList subclass
        array.add(item);

        /* Mapper is created with CustomList as T and Integer as V.
        CustomList must be a subclass of ArrayList and implement Formattable */
        Mapper<CustomList, Integer> mapper = new Mapper<CustomList, Integer>();

        Mapper<CustomList, ?> mapper;
        mapper = new Mapper<CustomList, Boolean>();
        mapper = new Mapper<CustomList, Integer>();
    }
}""".lines()
}