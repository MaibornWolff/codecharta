package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.LocationResolverStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.FilePrinterSpy
import org.junit.Test
import java.io.IOException

class AnnotationTest {

    @Test
    @Throws(IOException::class)
    fun example_has_correct_rloc_count() {
        val sourceCode = FileSystemSourceCode(OopLanguage.JAVA, code)
        val locationResolverStub = LocationResolverStub(listOf(sourceCode))
        val printerSpy = FilePrinterSpy()

        SourceApp(locationResolverStub, printerSpy).printMetrics(listOf("this file location is passed to our stub which returns code"))

        assertThatMetricElement(printerSpy.printedFileMetrics!!) {it.summary()[MetricType.RLoc]}.isEqualTo(3)
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

