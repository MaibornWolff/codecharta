package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceCodeParserEntryPoint
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.calculateSingleMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.SingleSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.FilePrinterSpy
import org.junit.Test
import java.io.IOException

class AnonymousClassTest {

    @Test
    @Throws(IOException::class)
    fun `example has correct rloc count`() {
        val sourceCode = SourceCode(OopLanguage.JAVA, code)
        val locationResolverStub = SingleSourceProviderStub(sourceCode)

        val singleMetrics = calculateSingleMetrics(locationResolverStub)

        assertThatMetricElement(singleMetrics) {it.summary()[MetricType.RLoc]}.isEqualTo(3)
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