package de.maibornwolff.codecharta.analysers.tools.gate.rules

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PathPatternsTest {
    @Test
    fun `should leave out what a later negated pattern takes back`() {
        // Arrange
        val patterns = PathPatterns(listOf("src/**", "!src/keep/**"))

        // Act
        val matchesKept = patterns.matches("src/keep/A.kt")
        val matchesOther = patterns.matches("src/other/B.kt")

        // Assert
        assertThat(matchesKept).isFalse()
        assertThat(matchesOther).isTrue()
    }

    @Test
    fun `should match nothing with only a negated pattern`() {
        // Arrange
        val patterns = PathPatterns(listOf("!generated/**"))

        // Act
        val matches = patterns.matches("generated/A.kt")

        // Assert
        assertThat(matches).isFalse()
    }

    @Test
    fun `should match every file below a folder pattern`() {
        // Arrange
        val patterns = PathPatterns(listOf("legacy/"))

        // Act
        val matchesDeepFile = patterns.matches("src/legacy/old/A.kt")
        val matchesFileNamedLikeTheFolder = patterns.matches("src/legacy")

        // Assert
        assertThat(matchesDeepFile).isTrue()
        assertThat(matchesFileNamedLikeTheFolder).isFalse()
    }

    @Test
    fun `should match a pattern without a slash at any depth and a rooted one only at the top`() {
        // Arrange
        val anyDepth = PathPatterns(listOf("*.generated.kt"))
        val rooted = PathPatterns(listOf("/Main.kt"))

        // Act
        val matchesDeepFile = anyDepth.matches("a/b/Api.generated.kt")
        val matchesTopFile = rooted.matches("Main.kt")
        val matchesNestedFile = rooted.matches("app/Main.kt")

        // Assert
        assertThat(matchesDeepFile).isTrue()
        assertThat(matchesTopFile).isTrue()
        assertThat(matchesNestedFile).isFalse()
    }
}
