package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test
import java.io.IOException

class InnerClassTest {
    @Test
    @Throws(IOException::class)
    fun annotation_example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(9)
    }

    private val code =
            """/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Inner class
class Foo { // Top-level class
    class Bar { // Inner class
    }

    static void inner_class_constructor() {
        // https://docs.oracle.com/javase/specs/jls/se9/html/jls-15.html#jls-15.9
        Foo foo = new Foo();
        Foo.Bar fooBar1 = foo.new Bar();
        Foo.Bar fooBar2 = new Foo().new Bar();
    }
}""".lines()
}