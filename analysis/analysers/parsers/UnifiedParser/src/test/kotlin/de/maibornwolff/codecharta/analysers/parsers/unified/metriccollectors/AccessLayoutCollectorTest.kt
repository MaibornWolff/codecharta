package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class AccessLayoutCollectorTest {
    @Test
    fun `should measure a report layout that Access wrote in UTF-16`(
        @TempDir root: File
    ) {
        // Arrange
        val layout = """
            Begin Report
                Begin
                    Begin Section
                        Begin
                            Begin TextBox
                                ControlSource ="=IIf([Menge] > 0,\"Übersicht\",\"\")"
                            End
                        End
                    End
                End
            End
        """.trimIndent()
        val report = root.resolve("rptÜbersicht.report")
        report.writeBytes(byteArrayOf(0xFF.toByte(), 0xFE.toByte()) + layout.toByteArray(Charsets.UTF_16LE))
        val collector = TreeSitterLibraryCollector(Language.ACCESS_LAYOUT)

        // Act
        val result = collector.collectMetricsForFile(report)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(1.0)
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_CONTROLS.metricName]).isEqualTo(1.0)
    }
}
