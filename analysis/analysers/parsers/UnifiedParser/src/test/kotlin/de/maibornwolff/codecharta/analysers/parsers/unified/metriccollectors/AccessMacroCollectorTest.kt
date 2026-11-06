package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class AccessMacroCollectorTest {
    @Test
    fun `should measure a macro that Access wrote in UTF-16`(
        @TempDir root: File
    ) {
        // Arrange
        val macro = """
            Version =196611
            Begin
                Condition ="[Menge] > 0 And [Bezahlt]"
                Action ="MsgBox"
                Argument ="Übersicht gedruckt"
            End
        """.trimIndent()
        val file = root.resolve("mcrÜbersicht.macro")
        file.writeBytes(byteArrayOf(0xFF.toByte(), 0xFE.toByte()) + macro.toByteArray(Charsets.UTF_16LE))
        val collector = TreeSitterLibraryCollector(Language.ACCESS_MACRO)

        // Act
        val result = collector.collectMetricsForFile(file)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(2.0)
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }
}
