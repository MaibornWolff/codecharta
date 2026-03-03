package de.maibornwolff.codecharta.analysers.analyserinterface.commit

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class CommitAnalysisContextTest {
    @Test
    fun `should return null when outputFile is null`() {
        // Arrange
        val context = CommitAnalysisContext(File("."), null, "abc1234")

        // Act
        val result = context.resolveOutputFile(null)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should return empty string when outputFile is empty`() {
        // Arrange
        val context = CommitAnalysisContext(File("."), null, "abc1234")

        // Act
        val result = context.resolveOutputFile("")

        // Assert
        assertThat(result).isEqualTo("")
    }

    @Test
    fun `should return outputFile unchanged when shortHash is null`() {
        // Arrange
        val context = CommitAnalysisContext(File("."), null, null)

        // Act
        val result = context.resolveOutputFile("output.cc.json")

        // Assert
        assertThat(result).isEqualTo("output.cc.json")
    }

    @Test
    fun `should prefix filename with shortHash`() {
        // Arrange
        val context = CommitAnalysisContext(File("."), null, "abc1234")

        // Act
        val result = context.resolveOutputFile("output.cc.json")

        // Assert
        assertThat(result).isEqualTo("abc1234.output.cc.json")
    }

    @Test
    fun `should prefix filename preserving parent directory`() {
        // Arrange
        val context = CommitAnalysisContext(File("."), null, "abc1234")

        // Act
        val result = context.resolveOutputFile("some/dir/output.cc.json")

        // Assert
        assertThat(result).isEqualTo(File("some/dir", "abc1234.output.cc.json").path)
    }
}
