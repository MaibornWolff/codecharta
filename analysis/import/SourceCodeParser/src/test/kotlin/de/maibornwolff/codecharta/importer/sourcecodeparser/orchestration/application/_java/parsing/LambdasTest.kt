package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test
import java.io.IOException

class LambdasTest {
    @Test
    @Throws(IOException::class)
    fun annotation_example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(19)
    }

    private val code =
            """/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne8.java
 */

// Lambdas
public class Lambdas {
    public static void main(String[] args) {
        // use predicate composition to remove matching names
        List<Name> list = new ArrayList<>();
        for (Name name : NAMES) {
            list.add(name);
        }
        Predicate<Name> pred1 = name -> "Sally".equals(name.firstName);
        Predicate<Name> pred2 = name -> "Queue".equals(name.lastName);
        list.removeIf(pred1.or(pred2));
        printNames("Names filtered by predicate:", list.toArray(new Name[list.size()]));

        Comparator<Name> com1 = Comparator.comparing((Name name1) -> name1.lastName)
                .thenComparing(name2 -> name2.firstName);
        Comparator<Name> com2 = Comparator.<Name,String>comparing(name1 -> name1.lastName)
                .thenComparing(name2 -> name2.firstName);

        // sort array using lambda expression
        copy = Arrays.copyOf(NAMES, NAMES.length);
        Arrays.sort(copy, (a, b) -> a.compareTo(b));
        printNames("Names sorted with lambda expression:", copy);
    }
}""".lines()
}