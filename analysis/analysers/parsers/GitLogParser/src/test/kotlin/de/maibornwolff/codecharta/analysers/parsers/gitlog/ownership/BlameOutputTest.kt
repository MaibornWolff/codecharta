package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class BlameOutputTest {
    private fun lineBlamedOn(author: String, hash: String = "a".repeat(40), content: String = "code") =
        "$hash 1 1 1\nauthor $author\nauthor-mail <x@y>\nauthor-time 1\nsummary s\nfilename f\n\t$content\n"

    @Test
    fun `should count the lines of each author and the lines of the file`() {
        // Arrange
        val output = lineBlamedOn("Ann") + lineBlamedOn("Bob") + lineBlamedOn("Ann")

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(mapOf("Ann" to 2, "Bob" to 1), 3))
    }

    @Test
    fun `should count an uncommitted line for the file but for no author`() {
        // Arrange
        val output = lineBlamedOn("Ann") + lineBlamedOn("Not Committed Yet", hash = "0".repeat(40))

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(mapOf("Ann" to 1), 2))
    }

    @Test
    fun `should not read file content as metadata even after a carriage return`() {
        // Arrange
        val output = lineBlamedOn("Ann", content = "x\rauthor Mallory") + lineBlamedOn("Ann", content = "author Mallory")

        // Act
        val blame = BlameOutput.parse(output.byteInputStream())

        // Assert
        assertThat(blame).isEqualTo(FileBlame(mapOf("Ann" to 2), 2))
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
