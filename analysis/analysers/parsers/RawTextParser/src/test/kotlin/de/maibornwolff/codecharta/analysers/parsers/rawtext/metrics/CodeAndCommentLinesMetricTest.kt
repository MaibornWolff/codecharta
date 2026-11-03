package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.Delimiters
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CodeAndCommentLinesMetricTest {
    private val cStyleSyntax = LanguageSyntax(
        lineComments = listOf("//"),
        blockComments = listOf(Delimiters("/*", "*/"))
    )

    @Test
    fun `should count real lines of code and comment lines`() {
        // Arrange
        val metric = CodeAndCommentLinesMetric(cStyleSyntax)
        val lines = listOf("/*", " * header", " */", "fun main() {", "", "    run() // go", "}")

        // Act
        lines.forEach { metric.parseLine(it) }
        val result = metric.getValue().metricsMap

        // Assert
        assertThat(result).containsExactlyInAnyOrderEntriesOf(mapOf("rloc" to 3.0, "comment_lines" to 4.0))
    }

    @Test
    fun `should report zero for both metrics when no lines are parsed`() {
        // Arrange
        val metric = CodeAndCommentLinesMetric(cStyleSyntax)

        // Act
        val result = metric.getValue().metricsMap

        // Assert
        assertThat(result).containsExactlyInAnyOrderEntriesOf(mapOf("rloc" to 0.0, "comment_lines" to 0.0))
    }
}
