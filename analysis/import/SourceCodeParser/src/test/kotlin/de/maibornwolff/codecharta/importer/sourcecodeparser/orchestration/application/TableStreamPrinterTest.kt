package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.elementsOf
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaSource
import de.maibornwolff.codecharta.importer.sourcecodeparser.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException

class TableStreamPrinterTest {
    @Test
    @Throws(IOException::class)
    fun `prints header all rows and trailing line`() {
        // Arrange
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)
        val output = retrieveStreamAsString {
            val tableStreamPrinter = TableStreamPrinter(it)

            // Act
            tableStreamPrinter.printDetails(detailedMetricTable)
        }
        println(output.lines())
        // Assert
        assertThat(output.lines().size).isEqualTo(detailedMetricTable.rowCount() + 2 + 1)
    }

    @Test
    @Throws(IOException::class)
    fun prints_correct_header_order() {
        // Arrange
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)
        val output = retrieveStreamAsString {
            val tableStreamPrinter = TableStreamPrinter(it)

            // Act
            tableStreamPrinter.printDetails(detailedMetricTable)
        }

        // Assert
        assertThat(elementsOf(output.lines()[0])).containsExactly("LoC", "RLoC", "Code", "Tags")
    }

    @Test
    @Throws(IOException::class)
    fun prints_underline() {
        // Arrange
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)
        val output = retrieveStreamAsString {
            val tableStreamPrinter = TableStreamPrinter(it)

            // Act
            tableStreamPrinter.printDetails(detailedMetricTable)
        }

        // Assert
        assertThat(output.lines()[1]).containsPattern("[-]{20,}")
    }

    @Test
    @Throws(IOException::class)
    fun prints_real_line_count_when_it_was_incremented() {
        // Arrange
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)
        val output = retrieveStreamAsString {
            val tableStreamPrinter = TableStreamPrinter(it)

            // Act
            tableStreamPrinter.printDetails(detailedMetricTable)
        }

        // Assert
        assertWithPrintOnFail(detailedMetricTable){elementsOf(output.lines()[3])[1]}.isEqualTo("2")
    }

    @Test
    @Throws(IOException::class)
    fun `does not print real line count when it wasnt incremented and instead prints empty tag list`() {
        // Arrange
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)
        val output = retrieveStreamAsString {
            val tableStreamPrinter = TableStreamPrinter(it)

            // Act
            tableStreamPrinter.printDetails(detailedMetricTable)
        }

        // Assert
        assertWithPrintOnFail(detailedMetricTable){elementsOf(output.lines()[4])[1]}.isEqualTo("[]")
    }

    private val code =
"""
package none;
import foo;

@Annotation
public class Foo {
    public void noop(){ }
}""".trim().lines()
}