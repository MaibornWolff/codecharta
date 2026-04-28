package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class DelphiCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.DELPHI)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".pas")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count if statements for complexity`() {
        // given - one procedure (defProc) plus one if-statement
        val fileContent = """
            unit U; interface implementation
            procedure Foo;
            begin
              if 1 = 1 then Bar;
            end;
            end.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then - 1 (defProc) + 1 (if) = 2
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count line and brace and star comments for comment lines`() {
        // given - one //, one { }, and one (* *)
        val fileContent = """
            unit U; // line comment
            { brace comment }
            (* star comment *)
            interface
            implementation
            end.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count procedure and function declarations for number of functions`() {
        // given - a procedure and a function implementation
        val fileContent = """
            unit U; interface implementation
            procedure Foo;
            begin
            end;
            function Bar: Integer;
            begin
              Result := 1;
            end;
            end.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should detect a parenthesised method chain as one message chain`() {
        // given - 4 chained parenthesised calls (Obj.M1().M2().M3().M4()) form one chain
        val fileContent = """
            unit U; interface implementation
            procedure Foo;
            begin
              Obj.M1().M2().M3().M4();
            end;
            end.
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then - the exprDot/exprCall ignore rule in DelphiDefinition prevents double-counting
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }
}
