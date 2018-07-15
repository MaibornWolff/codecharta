package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.elementsOf
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.javaSource
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException

class TableConverterTest {
    @Test
    fun `prints header and all code lines`() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        val output = detailedMetricToTable(detailedMetricTable)

        assertThat(output.lines().size).isEqualTo(2 + detailedMetricTable.rowCount())
    }

    @Test
    fun prints_correct_header_order() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        val output = detailedMetricToTable(detailedMetricTable)

        assertThat(elementsOf(output.lines()[0])).containsExactly("LoC", "RLoC", "MCC", "Code", "Tags")
    }

    @Test
    fun prints_underline() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        val output = detailedMetricToTable(detailedMetricTable)

        assertThat(output.lines()[1]).containsPattern("[-]{20,}")
    }

    @Test
    fun prints_real_line_count_when_it_was_incremented() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        val output = detailedMetricToTable(detailedMetricTable)

        assertWithPrintOnFail(detailedMetricTable) { elementsOf(output.lines()[3])[1] }.isEqualTo("2")
    }

    @Test
    @Throws(IOException::class)
    fun `does not print real line count when it wasnt incremented and instead prints empty tag list`() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)
        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        val output = detailedMetricToTable(detailedMetricTable)

        assertWithPrintOnFail(detailedMetricTable) { elementsOf(output.lines()[4])[1] }.isEqualTo("[]")
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