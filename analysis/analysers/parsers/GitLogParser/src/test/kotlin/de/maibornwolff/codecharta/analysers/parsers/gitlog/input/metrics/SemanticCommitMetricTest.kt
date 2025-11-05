package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class SemanticCommitMetricTest {
    @Test
    fun should_have_initial_value_zero() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "feat",
            metricName = "feat_commits",
            description = "Feature commits",
            matchPattern = MatchPattern.StartsWith("feat")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act & Assert
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_use_commit_type_metric_name() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "test",
            metricName = "test_commits",
            description = "Test commits",
            matchPattern = MatchPattern.StartsWith("test")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act & Assert
        assertThat(metric.metricName()).isEqualTo("test_commits")
    }

    @Test
    fun should_use_commit_type_description() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "docs",
            metricName = "docs_commits",
            description = "Documentation commits",
            matchPattern = MatchPattern.StartsWith("docs")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act & Assert
        assertThat(metric.description()).isEqualTo("Documentation commits")
    }

    @Test
    fun should_increment_for_matching_commit() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "fix",
            metricName = "fix_commits",
            description = "Fix commits",
            matchPattern = MatchPattern.StartsWith("fix")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: bug fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increment_for_non_matching_commit() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "feat",
            metricName = "feat_commits",
            description = "Feature commits",
            matchPattern = MatchPattern.StartsWith("feat")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: bug fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increment_multiple_times() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "refactor",
            metricName = "refactor_commits",
            description = "Refactor commits",
            matchPattern = MatchPattern.StartsWith("refactor")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor: improve code"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor: clean up"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // Assert
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_case_insensitivity() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "style",
            metricName = "style_commits",
            description = "Style commits",
            matchPattern = MatchPattern.StartsWith("style")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style: format"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "STYLE: format"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Style: format"))

        // Assert
        assertThat(metric.value()).isEqualTo(3L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "docs",
            metricName = "docs_commits",
            description = "Docs commits",
            matchPattern = MatchPattern.StartsWith("docs")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  docs: update readme  "))

        // Assert
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_parentheses_format() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "feat",
            metricName = "feat_commits",
            description = "Feature commits",
            matchPattern = MatchPattern.StartsWith("feat")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat(scope): add feature"))

        // Assert
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_space_format() {
        // Arrange
        val commitType = SemanticCommitType(
            name = "test",
            metricName = "test_commits",
            description = "Test commits",
            matchPattern = MatchPattern.StartsWith("test")
        )
        val metric = SemanticCommitMetric(commitType)

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test add coverage"))

        // Assert
        assertThat(metric.value()).isEqualTo(1L)
    }
}
