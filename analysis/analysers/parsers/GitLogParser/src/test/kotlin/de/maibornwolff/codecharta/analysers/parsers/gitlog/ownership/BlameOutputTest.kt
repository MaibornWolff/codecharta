package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class BlameOutputTest {
    private val annsCommit = "a".repeat(40)
    private val bobsCommit = "b".repeat(40)

    private fun lineOf(hash: String, content: String = "code") =
        "$hash 1 1 1\nauthor Someone\nauthor-mail <x@y>\nauthor-time 1\nsummary s\nfilename f\n\t$content\n"

    @Test
    fun `should count the lines of each commit and the lines of the file`() {
        // Arrange
        val output = lineOf(annsCommit) + lineOf(bobsCommit) + lineOf(annsCommit)

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(mapOf(annsCommit to 2, bobsCommit to 1), 3))
    }

    @Test
    fun `should count an uncommitted line for the file but for no commit`() {
        // Arrange
        val output = lineOf(annsCommit) + lineOf("0".repeat(40))

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(mapOf(annsCommit to 1), 2))
    }

    @Test
    fun `should not read file content as metadata even after a carriage return`() {
        // Arrange
        val output = lineOf(annsCommit, content = "x\r$bobsCommit 1 1 1") + lineOf(annsCommit, content = "$bobsCommit 1 1 1")

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(mapOf(annsCommit to 2), 2))
    }

    @Test
    fun `should read nothing from an empty file`() {
        // Arrange
        val output = ""

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(emptyMap(), 0))
    }
}
