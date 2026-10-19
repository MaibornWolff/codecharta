package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class SqlCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.SQL)

    private fun createTestFile(content: String, extension: String = ".sql"): File {
        val tempFile = File.createTempFile("testFile", extension)
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count the procedure and its branch for complexity`() {
        // Arrange
        val input = createTestFile(
            """
            CREATE PROCEDURE dbo.level_up @hero_id INT
            AS
            BEGIN
              IF @hero_id > 0
                UPDATE heroes SET level = level + 1 WHERE id = @hero_id
            END
            GO
            """.trimIndent()
        )

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count the procedure and its exception handler and the comment of an Oracle package body file`() {
        // Arrange
        val input = createTestFile(
            """
            CREATE OR REPLACE PACKAGE BODY quest_pkg AS
              -- Starts a quest
              PROCEDURE start_quest(p_hero IN NUMBER) IS
              BEGIN
                NULL;
              EXCEPTION
                WHEN OTHERS THEN RAISE;
              END start_quest;
            END quest_pkg;
            /
            """.trimIndent(),
            extension = ".pkb"
        )

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
        assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(1.0)
    }
}
