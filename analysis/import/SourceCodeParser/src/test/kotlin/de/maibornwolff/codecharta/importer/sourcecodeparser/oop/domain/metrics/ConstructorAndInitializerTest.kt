package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.LocationResolverStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.FilePrinterSpy
import org.junit.Test
import java.io.IOException

class ConstructorAndInitializerTest {
    @Test
    @Throws(IOException::class)
    fun example_has_correct_rloc_count() {
        val sourceCode = FileSystemSourceCode(OopLanguage.JAVA, code)
        val locationResolverStub = LocationResolverStub(listOf(sourceCode))
        val printerSpy = FilePrinterSpy()

        SourceApp(locationResolverStub, printerSpy).printMetrics(listOf("this file location is passed to our stub which returns code"))

        assertThatMetricElement(printerSpy.printedFileMetrics!!) {it.summary()[MetricType.RLoc]}.isEqualTo(9)
    }

    private val code =
            """
/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Constructors and initializers
class Foo {

    private static final String hello;

    String str;

    Foo() { // Constructor with no arguments
        // Initialization
    }

    Foo(String str) { // Constructor with one argument
        this.str = str;
    }

    static {
        System.out.println(AbstractClass.class.getName() + ": static block runtime");
        hello = "hello from " + AbstractClass.class.getName();
    }

    {
        System.out.println(AbstractClass.class.getName() + ": instance block runtime");
    }
}
""".trim().lines()
}