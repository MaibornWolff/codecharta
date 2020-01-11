package de.maibornwolff.codecharta.indentationlevelparser.metrics

import de.maibornwolff.codecharta.importer.indentationlevelparser.metrics.IndentationCounter
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class IndentationCounterTest {

    private fun addDoubleSpacedLines(indentationCounter: IndentationCounter) {
        indentationCounter.parseLine("    foo")
        indentationCounter.parseLine("  foo")
        indentationCounter.parseLine("  foo")
        indentationCounter.parseLine("foo")
    }

    @Test
    fun `should register indentation with tabs`() {
        val indentationCounter = IndentationCounter()

        indentationCounter.parseLine("\t\tfoo")
        indentationCounter.parseLine("\tfoo")
        indentationCounter.parseLine("\tfoo")
        indentationCounter.parseLine("foo")
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(4.0)
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_3+"]).isEqualTo(0.0)
    }

    @Test
    fun `should register indentation with spaces`() {
        val indentationCounter = IndentationCounter()

        indentationCounter.parseLine("  foo")
        indentationCounter.parseLine(" foo")
        indentationCounter.parseLine(" foo")
        indentationCounter.parseLine("foo")
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(4.0)
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_3+"]).isEqualTo(0.0)
    }

    @Test
    fun `should guess indentation width correctly`() {
        val printContent = ByteArrayOutputStream()
        val writer = PrintStream(printContent)
        val indentationCounter = IndentationCounter(stderr = writer, verbose = true)

        addDoubleSpacedLines(indentationCounter)
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(4.0)
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_3+"]).isEqualTo(0.0)
        Assertions.assertThat(printContent.toString()).contains("INFO: Assumed tab width to be 2")
    }

    @Test
    fun `should calculate indentations based on given tabWidth`() {
        val indentationCounter = IndentationCounter()

        indentationCounter.setParameters(mapOf("tabWidth" to 1))
        addDoubleSpacedLines(indentationCounter)
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(3.0)
        Assertions.assertThat(result["indentation_level_4+"]).isEqualTo(1.0)
    }

    @Test
    fun `should correct invalid indentation levels`() {
        val printContent = ByteArrayOutputStream()
        val writer = PrintStream(printContent)
        val indentationCounter = IndentationCounter(stderr = writer)

        indentationCounter.setParameters(mapOf("tabWidth" to 3))
        addDoubleSpacedLines(indentationCounter)
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_1+"]).isEqualTo(3.0)
        Assertions.assertThat(printContent.toString()).contains("WARN: Corrected mismatching indentations, moved 2 lines to indentation level 1+")
        Assertions.assertThat(printContent.toString()).contains("WARN: Corrected mismatching indentations, moved 1 lines to indentation level 2+")
    }

    @Test
    fun `should consider maximum indentation levels`() {
        val indentationCounter = IndentationCounter(maxIndentation = 2)

        indentationCounter.parseLine("\t\tfoo")
        indentationCounter.parseLine("\t\t\tfoo")
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(2.0)
        Assertions.assertThat(result).doesNotContainKey("indentation_level_3+")
    }

    @Test
    fun `should ignore lines that contain only spaces or tabs`() {
        val indentationCounter = IndentationCounter()

        indentationCounter.parseLine("\t\t")
        indentationCounter.parseLine("      ")
        indentationCounter.parseLine("     foo")
        val result = indentationCounter.getValue().metricMap

        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(0.0)
        Assertions.assertThat(result["indentation_level_1+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(1.0)
    }
}