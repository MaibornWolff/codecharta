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
    fun should_match_with_contains_pattern() {
        // Arrange
        val pattern = MatchPattern.Contains("hotfix")

        // Act & Assert
        assertThat(pattern.matches("hotfix: urgent fix")).isTrue()
        assertThat(pattern.matches("fix: this is a hotfix")).isTrue()
        assertThat(pattern.matches("HOTFIX: critical")).isTrue()
        assertThat(pattern.matches("Hotfix for bug")).isTrue()
        assertThat(pattern.matches("feat: add feature")).isFalse()
    }

    @Test
    fun should_match_with_regex_pattern() {
        // Arrange
        val pattern = MatchPattern.Regex("^(feat|fix)\\b")

        // Act & Assert
        assertThat(pattern.matches("feat: add feature")).isTrue()
        assertThat(pattern.matches("fix: bug fix")).isTrue()
        assertThat(pattern.matches("FEAT: uppercase")).isTrue()
        assertThat(pattern.matches("  fix: with whitespace")).isTrue()
        assertThat(pattern.matches("docs: documentation")).isFalse()
        assertThat(pattern.matches("feature: not matching")).isFalse()
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
    fun should_be_case_insensitive_for_contains() {
        // Arrange
        val pattern = MatchPattern.Contains("refactor")

        // Act & Assert
        assertThat(pattern.matches("refactor code")).isTrue()
        assertThat(pattern.matches("REFACTOR code")).isTrue()
        assertThat(pattern.matches("Refactor code")).isTrue()
        assertThat(pattern.matches("need to refactor")).isTrue()
    }

    @Test
    fun should_be_case_insensitive_for_regex() {
        // Arrange
        val pattern = MatchPattern.Regex("^docs\\b")

        // Act & Assert
        assertThat(pattern.matches("docs: update")).isTrue()
        assertThat(pattern.matches("DOCS: update")).isTrue()
        assertThat(pattern.matches("Docs: update")).isTrue()
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

    @Test
    fun should_trim_whitespace_for_regex() {
        // Arrange
        val pattern = MatchPattern.Regex("^fix\\b")

        // Act & Assert
        assertThat(pattern.matches("   fix: bug")).isTrue()
        assertThat(pattern.matches("fix: bug   ")).isTrue()
    }
}
