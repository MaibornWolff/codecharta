package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class MatchPatternTest {
    @Test
    fun should_match_with_starts_with_pattern() {
        // Arrange
        val pattern = MatchPattern.StartsWith("feat")

        // Act & Assert
        assertThat(pattern.matches("feat: add new feature")).isTrue()
        assertThat(pattern.matches("feat(scope): add feature")).isTrue()
        assertThat(pattern.matches("FEAT: add feature")).isTrue()
        assertThat(pattern.matches("Feat add feature")).isTrue()
        assertThat(pattern.matches("  feat: with whitespace")).isTrue()
        assertThat(pattern.matches("fix: not a feature")).isFalse()
        assertThat(pattern.matches("this is a feat inside")).isFalse()
    }

    @Test
    fun should_be_case_insensitive_for_starts_with() {
        // Arrange
        val pattern = MatchPattern.StartsWith("test")

        // Act & Assert
        assertThat(pattern.matches("test: add tests")).isTrue()
        assertThat(pattern.matches("TEST: add tests")).isTrue()
        assertThat(pattern.matches("Test: add tests")).isTrue()
        assertThat(pattern.matches("TeSt: add tests")).isTrue()
    }

    @Test
    fun should_trim_whitespace_for_starts_with() {
        // Arrange
        val pattern = MatchPattern.StartsWith("style")

        // Act & Assert
        assertThat(pattern.matches("   style: format code")).isTrue()
        assertThat(pattern.matches("style: format code   ")).isTrue()
        assertThat(pattern.matches("  style: format code  ")).isTrue()
    }
}
