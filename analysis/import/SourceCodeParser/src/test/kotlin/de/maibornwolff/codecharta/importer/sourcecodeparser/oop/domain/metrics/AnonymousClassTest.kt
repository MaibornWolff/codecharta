package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaSource
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import org.junit.Test
import java.io.IOException

class AnonymousClassTest {

    @Test
    fun `example has correct rloc count`() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.RLoc]}.isEqualTo(3)
    }

    private val code =
            """
/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Anonymous class
class Foo {
    void bar() {

        new Object() {// Creation of a new anonymous class extending Object
        };
    }
}
""".trim().lines()

}