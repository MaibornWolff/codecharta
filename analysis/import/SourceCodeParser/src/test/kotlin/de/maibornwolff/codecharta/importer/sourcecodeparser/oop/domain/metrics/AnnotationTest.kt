package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.calculateSingleMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.SingleSourceProviderStub
import org.junit.Test
import java.io.IOException

class AnnotationTest {

    @Test
    @Throws(IOException::class)
    fun `example has correct rloc count`() {
        val sourceCode = SourceCode(OopLanguage.JAVA, code)
        val locationResolverStub = SingleSourceProviderStub(sourceCode)

        val singleMetrics = calculateSingleMetrics(locationResolverStub)

        assertThatMetricElement(singleMetrics) { it.sum[MetricType.RLoc]}.isEqualTo(3)
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

