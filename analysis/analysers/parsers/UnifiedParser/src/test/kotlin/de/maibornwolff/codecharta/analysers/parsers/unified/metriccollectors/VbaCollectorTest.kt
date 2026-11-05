package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class VbaCollectorTest {
    private fun createTestFile(content: String, extension: String): File {
        val tempFile = File.createTempFile("testFile", extension)
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count procedures, branches and logical operators for complexity`() {
        // Arrange
        val collector = TreeSitterLibraryCollector(Language.VBA)
        val input = createTestFile(
            """
            Public Function Total(ByVal a As Long, ByVal b As Long) As Long
                If a > 0 And b > 0 Then
                    Total = a + b
                End If
            End Function
            """.trimIndent(),
            ".bas"
        )

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count the closing line of a loop as a real line of code`() {
        // Arrange
        val collector = TreeSitterLibraryCollector(Language.VBA)
        val input = createTestFile(
            """
            Sub Count()
                ' counts to three
                Do While i < 3
                    i = i + 1
                Loop

            End Sub
            """.trimIndent(),
            ".cls"
        )

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(5.0)
    }

    @Test
    fun `should measure the code behind the layout of a VB6 form`() {
        // Arrange
        val collector = TreeSitterLibraryCollector(Language.VB6)
        val input = createTestFile(
            """
            VERSION 5.00
            Begin VB.Form frmMain
               Caption         =   "Main"
            End
            Private Sub Form_Load()
            End Sub
            """.trimIndent(),
            ".frm"
        )

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }
}
