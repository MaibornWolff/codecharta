package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class AblCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.ABL)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".p")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count procedure for number of functions`() {
        // given
        val fileContent = """
            PROCEDURE myProcedure:
                DISPLAY "Hello World".
            END PROCEDURE.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count function for number of functions`() {
        // given
        val fileContent = """
            FUNCTION addNumbers RETURNS INTEGER (INPUT a AS INTEGER, INPUT b AS INTEGER):
                RETURN a + b.
            END FUNCTION.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count if statement for complexity`() {
        // given
        val fileContent = """
            IF x > 0 THEN
                DISPLAY "positive".
            ELSE
                DISPLAY "not positive".
            END.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val complexity = result.attributes[AvailableFileMetrics.COMPLEXITY.metricName] as Double
        assertThat(complexity).isGreaterThanOrEqualTo(1.0)
    }

    @Test
    fun `should count do while loop for complexity`() {
        // given
        val fileContent = """
            DO WHILE i < 10:
                i = i + 1.
            END.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val complexity = result.attributes[AvailableFileMetrics.COMPLEXITY.metricName] as Double
        assertThat(complexity).isGreaterThanOrEqualTo(1.0)
    }

    @Test
    fun `should count comments for comment_lines`() {
        // given
        val fileContent = """
            /* This is a block comment
               spanning multiple lines */
            DEFINE VARIABLE x AS INTEGER NO-UNDO.
            // This is a line comment
            x = 10.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val commentLines = result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName] as Double
        assertThat(commentLines).isGreaterThanOrEqualTo(2.0)
    }

    @Test
    fun `should calculate real lines of code`() {
        // given
        val fileContent = """
            DEFINE VARIABLE x AS INTEGER NO-UNDO.

            /* comment */
            x = 10.
            DISPLAY x.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val rloc = result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName] as Double
        assertThat(rloc).isGreaterThanOrEqualTo(3.0)
    }

    @Test
    fun `should calculate lines of code including empty lines and comments`() {
        // given
        val fileContent = """
            DEFINE VARIABLE x AS INTEGER NO-UNDO.

            /* comment */
            x = 10.
            DISPLAY x.
        """.trimIndent() + "\n"
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(5.0)
    }

    @Test
    fun `should correctly calculate parameters per function metric`() {
        // given
        val fileContent = """
            FUNCTION noParams RETURNS INTEGER:
                RETURN 1.
            END FUNCTION.

            FUNCTION twoParams RETURNS INTEGER (INPUT a AS INTEGER, INPUT b AS INTEGER):
                RETURN a + b.
            END FUNCTION.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(2.0)
        assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
    }
}
