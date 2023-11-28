package de.maibornwolff.codecharta.rawtextparser.metrics

import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.parser.rawtextparser.metrics.IndentationMetric
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.verify
import mu.KLogger
import mu.KotlinLogging
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class IndentationMetricTest {

    private val defaultVerbose = false
    private val defaultMaxIndentLvl = RawTextParser.DEFAULT_INDENT_LVL
    private val defaultTabWidth = RawTextParser.DEFAULT_TAB_WIDTH

    private fun addDoubleSpacedLines(indentationCounter: IndentationMetric) {
        indentationCounter.parseLine("    foo")
        indentationCounter.parseLine("  foo")
        indentationCounter.parseLine("  foo")
        indentationCounter.parseLine("foo")
    }

    @Test
    fun `should register indentation when parsing tabs`() {
        // given
        val indentationCounter = IndentationMetric(defaultMaxIndentLvl, defaultVerbose, defaultTabWidth)

        // when
        indentationCounter.parseLine("\t\tfoo")
        indentationCounter.parseLine("\tfoo")
        indentationCounter.parseLine("\tfoo")
        indentationCounter.parseLine("foo")
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(4.0)
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_3+"]).isEqualTo(0.0)
    }

    @Test
    fun `should register indentation when parsing spaces`() {
        // given
        val indentationCounter = IndentationMetric(defaultMaxIndentLvl, defaultVerbose, defaultTabWidth)

        // when
        indentationCounter.parseLine("  foo")
        indentationCounter.parseLine(" foo")
        indentationCounter.parseLine(" foo")
        indentationCounter.parseLine("foo")
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(4.0)
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_3+"]).isEqualTo(0.0)
    }

    @Test
    fun `should guess indentation width correctly when provided with default tab width`() {
        // given
        mockkObject(KotlinLogging)
        val loggerMock = mockk<KLogger>()
        val lambdaSlot = slot<(() -> Unit)>()
        val messagesLogged = mutableListOf<String>()
        every { KotlinLogging.logger(capture(lambdaSlot)) } returns loggerMock
        every { loggerMock.info(capture(messagesLogged)) } returns Unit

        // when
        val indentationCounter = IndentationMetric(defaultMaxIndentLvl, verbose = true, defaultTabWidth)
        addDoubleSpacedLines(indentationCounter)
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(4.0)
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_3+"]).isEqualTo(0.0)
        Assertions.assertThat(messagesLogged).contains("Assumed tab width to be 2")
        verify { loggerMock.info(any<String>()) }
    }

    @Test
    fun `should calculate indentations when tabWidth is given`() {
        // given
        val indentationCounter = IndentationMetric(defaultMaxIndentLvl, defaultVerbose, tabWidth = 1)

        // when
        addDoubleSpacedLines(indentationCounter)
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(3.0)
        Assertions.assertThat(result["indentation_level_4+"]).isEqualTo(1.0)
    }

    @Test
    fun `should correct indentation levels when input was invalid`() {
        // given
        mockkObject(KotlinLogging)
        val loggerMock = mockk<KLogger>()
        val lambdaSlot = slot<(() -> Unit)>()
        val messagesLogged = mutableListOf<String>()
        every { KotlinLogging.logger(capture(lambdaSlot)) } returns loggerMock
        every { loggerMock.warn(capture(messagesLogged)) } returns Unit

        // when
        val indentationCounter = IndentationMetric(defaultMaxIndentLvl, defaultVerbose, tabWidth = 3)
        addDoubleSpacedLines(indentationCounter)
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_1+"]).isEqualTo(3.0)
        Assertions.assertThat(messagesLogged).contains("Corrected mismatching indentations, moved 2 lines to indentation level 1+")
        Assertions.assertThat(messagesLogged).contains("Corrected mismatching indentations, moved 1 lines to indentation level 2+")
        verify { loggerMock.warn(any<String>()) }
    }

    @Test
    fun `should limit indentation level when provided with maximum indentation level`() {
        // given
        val indentationCounter = IndentationMetric(maxIndentation = 2, defaultVerbose, defaultTabWidth)

        // when
        indentationCounter.parseLine("\t\tfoo")
        indentationCounter.parseLine("\t\t\tfoo")
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(2.0)
        Assertions.assertThat(result).doesNotContainKey("indentation_level_3+")
    }

    @Test
    fun `should ignore lines when they contain only spaces or tabs`() {
        // given
        val indentationCounter = IndentationMetric(defaultMaxIndentLvl, defaultVerbose, defaultTabWidth)

        // when
        indentationCounter.parseLine("\t\t")
        indentationCounter.parseLine("      ")
        indentationCounter.parseLine("     foo")
        val result = indentationCounter.getValue().metricMap

        // then
        Assertions.assertThat(result["indentation_level_2+"]).isEqualTo(0.0)
        Assertions.assertThat(result["indentation_level_1+"]).isEqualTo(1.0)
        Assertions.assertThat(result["indentation_level_0+"]).isEqualTo(1.0)
    }
}
