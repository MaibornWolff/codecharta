package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LinesOfCodeMetricTest {
    @Test
    fun `should count non-blank lines correctly`() {
        // given
        val linesOfCodeMetric = LinesOfCodeMetric()

        // when
        linesOfCodeMetric.parseLine("fun main() {")
        linesOfCodeMetric.parseLine("    println(\"Hello, World!\")")
        linesOfCodeMetric.parseLine("    // This is a comment")
        linesOfCodeMetric.parseLine("")
        linesOfCodeMetric.parseLine("}")
        linesOfCodeMetric.parseLine("   ")
        linesOfCodeMetric.parseLine("")

        val result = linesOfCodeMetric.getValue().metricsMap

        // then
        assertThat(result["loc"]).isEqualTo(7.0)
    }

    @Test
    fun `should return zero when no lines are parsed`() {
        // given
        val linesOfCodeMetric = LinesOfCodeMetric()

        // when
        val result = linesOfCodeMetric.getValue().metricsMap

        // then
        assertThat(result["loc"]).isEqualTo(0.0)
    }

    @Test
    fun `should not ignore blank lines`() {
        // given
        val linesOfCodeMetric = LinesOfCodeMetric()

        // when
        linesOfCodeMetric.parseLine("   ")
        linesOfCodeMetric.parseLine("\t")
        linesOfCodeMetric.parseLine("")

        val result = linesOfCodeMetric.getValue().metricsMap

        // then
        assertThat(result["loc"]).isEqualTo(3.0)
    }
}
