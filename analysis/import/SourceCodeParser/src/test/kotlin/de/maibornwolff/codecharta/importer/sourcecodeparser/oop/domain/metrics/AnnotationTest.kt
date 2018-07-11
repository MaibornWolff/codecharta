package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaSource
import org.junit.Test
import java.io.IOException

class AnnotationTest {

    @Test
    @Throws(IOException::class)
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

@interface BlockingOperations {
    boolean fileSystemOperations();
    boolean networkOperations() default false;
}
""".trim().lines()
}

