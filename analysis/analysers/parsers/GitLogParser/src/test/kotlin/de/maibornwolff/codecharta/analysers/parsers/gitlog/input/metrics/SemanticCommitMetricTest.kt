package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class SemanticCommitMetricTest {
    @Test
    fun should_have_initial_value_zero() {
        // Arrange
        val metric = SemanticCommitMetric(
            commitType = "docs",
            commitDescription = "Docs Commits: Number of documentation commits (starting with 'docs') for this file.",
            detector = SemanticCommitDetector::isDocsCommit
        )

        // Act
        val value = metric.value()

        // Assert
        assertThat(value).isEqualTo(0L)
    }

    @Test
    fun should_return_correct_metric_name() {
        // Arrange
        val metric = SemanticCommitMetric(
            commitType = "feat",
            commitDescription = "Feat Commits: Number of feature commits (starting with 'feat') for this file.",
            detector = SemanticCommitDetector::isFeatCommit
        )

        // Act
        val name = metric.metricName()

        // Assert
        assertThat(name).isEqualTo("feat_commits")
    }

    @Test
    fun should_return_provided_description() {
        // Arrange
        val expectedDescription = "Fix Commits: Number of bug fix commits (starting with 'fix') for this file."
        val metric = SemanticCommitMetric(
            commitType = "fix",
            commitDescription = expectedDescription,
            detector = SemanticCommitDetector::isFixCommit
        )

        // Act
        val description = metric.description()

        // Assert
        assertThat(description).isEqualTo(expectedDescription)
    }

    @Test
    fun should_increment_when_detector_returns_true() {
        // Arrange
        val metric = SemanticCommitMetric(
            commitType = "docs",
            commitDescription = "Docs Commits: Number of documentation commits (starting with 'docs') for this file.",
            detector = SemanticCommitDetector::isDocsCommit
        )

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: update documentation"))

        // Assert
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increment_when_detector_returns_false() {
        // Arrange
        val metric = SemanticCommitMetric(
            commitType = "docs",
            commitDescription = "Docs Commits: Number of documentation commits (starting with 'docs') for this file.",
            detector = SemanticCommitDetector::isDocsCommit
        )

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // Assert
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increment_for_multiple_matching_commits() {
        // Arrange
        val metric = SemanticCommitMetric(
            commitType = "test",
            commitDescription = "Test Commits: Number of test commits (starting with 'test') for this file.",
            detector = SemanticCommitDetector::isTestCommit
        )

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add unit tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add integration tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // Assert
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_work_with_all_semantic_commit_types() {
        // Arrange
        val metrics = listOf(
            SemanticCommitMetric("docs", "Docs commits", SemanticCommitDetector::isDocsCommit) to "docs: update",
            SemanticCommitMetric("feat", "Feat commits", SemanticCommitDetector::isFeatCommit) to "feat: add",
            SemanticCommitMetric("fix", "Fix commits", SemanticCommitDetector::isFixCommit) to "fix: correct",
            SemanticCommitMetric("style", "Style commits", SemanticCommitDetector::isStyleCommit) to "style: format",
            SemanticCommitMetric("refactor", "Refactor commits", SemanticCommitDetector::isRefactorCommit) to "refactor: improve",
            SemanticCommitMetric("test", "Test commits", SemanticCommitDetector::isTestCommit) to "test: add",
            SemanticCommitMetric("hotfix", "Hotfix commits", SemanticCommitDetector::isHotfixCommit) to "hotfix: urgent"
        )

        // Act & Assert
        metrics.forEach { (metric, message) ->
            metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, message))
            assertThat(metric.value()).isEqualTo(1L)
        }
    }
}
