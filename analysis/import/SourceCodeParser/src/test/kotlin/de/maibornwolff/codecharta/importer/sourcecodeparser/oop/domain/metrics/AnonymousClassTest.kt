package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.LocationResolverStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.PrinterSpy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class AnonymousClassTest {

    @Test
    @Throws(IOException::class)
    fun example_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/AnonymousClass.java"
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

// Anonymous class
class Foo {
    void bar() {

        new Object() {// Creation of a new anonymous class extending Object
        };
    }
}
""".trim().lines()

}