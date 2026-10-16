package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class AngularCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.ANGULAR)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count control flow blocks structural directives and logical operators for complexity`() {
        // Arrange
        val fileContent = """
            @if (party.size > 3 || party.hasCentaur) {
              <p>Too crowded</p>
            } @else {
              <p>Welcome</p>
            }
            <li *ngFor="let room of rooms">{{ room.isLit ? 'lit' : 'dark' }}</li>
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count html comment lines and real lines of code`() {
        // Arrange
        val fileContent = """
            <!-- The cellar door -->
            <section>

              <app-torch />
            </section>
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(1.0)
        assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3.0)
        assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(5.0)
    }
}
