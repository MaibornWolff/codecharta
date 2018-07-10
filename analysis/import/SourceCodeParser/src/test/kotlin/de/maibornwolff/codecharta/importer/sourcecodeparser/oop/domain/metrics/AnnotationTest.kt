package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.LocationResolverStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.PrinterSpy
import org.junit.Test
import java.io.IOException
import java.nio.file.Paths

class AnnotationTest {

    @Test
    @Throws(IOException::class)
    fun example_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/Annotation.java"
        val sourceCode = FileSystemSourceCode("java", code)
        val locationResolverStub = LocationResolverStub(listOf(sourceCode))
        val printerSpy = PrinterSpy()

        SourceApp(locationResolverStub, printerSpy).printMetrics(listOf(resource))

        assertThatMetricElement(printerSpy.printedRowMetrics!!) {it.summary()[MetricType.RLoc]}.isEqualTo(3)
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

