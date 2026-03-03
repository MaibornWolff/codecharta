package de.maibornwolff.codecharta.analysers.analyserinterface

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class CommonAnalyserParametersTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should return original input when commit is null`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = null, localChanges = false)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.worktreeManager).isNull()
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should throw when commit and localChanges both set`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "HEAD", localChanges = true)
        val inputFile = tempDir.toFile()

        // Act & Assert
        assertThatThrownBy { params.testResolveEffectiveInput(inputFile) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("mutually exclusive")
    }

    @Test
    fun `should treat blank commit as null`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "   ", localChanges = false)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.worktreeManager).isNull()
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should treat empty commit as null`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "", localChanges = false)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.worktreeManager).isNull()
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should not throw when blank commit combined with localChanges`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "  ", localChanges = true)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.shortHash).isNull()
    }

    private class TestableAnalyserParameters(commit: String?, localChanges: Boolean) : CommonAnalyserParameters() {
        init {
            this.commit = commit
            this.localChanges = localChanges
        }

        fun testResolveEffectiveInput(inputFile: File) = resolveEffectiveInput(inputFile)
    }
}
