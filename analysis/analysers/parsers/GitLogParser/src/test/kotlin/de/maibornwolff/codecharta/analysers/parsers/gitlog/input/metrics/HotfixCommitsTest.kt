package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class HotfixCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // Arrange
        val metric = HotfixCommits()

        // Act & Assert
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_return_correct_metric_name() {
        // Arrange
        val metric = HotfixCommits()

        // Act & Assert
        assertThat(metric.metricName()).isEqualTo("hotfix_commits")
    }

    @Test
    fun should_return_correct_description() {
        // Arrange
        val metric = HotfixCommits()

        // Act & Assert
        assertThat(metric.description()).isEqualTo("Hotfix Commits: Number of hotfix commits (containing 'hotfix') for this file.")
    }

    @Test
    fun should_increment_for_commit_containing_hotfix() {
        // Arrange
        val metric = HotfixCommits()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increment_for_commit_without_hotfix() {
        // Arrange
        val metric = HotfixCommits()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: normal bug fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_match_hotfix_anywhere_in_message() {
        // Arrange
        val metric = HotfixCommits()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: this is a hotfix for critical issue"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: another fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_case_insensitivity() {
        // Arrange
        val metric = HotfixCommits()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: lowercase"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "HOTFIX: uppercase"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Hotfix: mixed case"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "HoTfIx: weird case"))

        // Assert
        assertThat(metric.value()).isEqualTo(4L)
    }

    @Test
    fun should_increment_multiple_times() {
        // Arrange
        val metric = HotfixCommits()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: first fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: second fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: normal fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: third fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(3L)
    }

    @Test
    fun should_handle_empty_message() {
        // Arrange
        val metric = HotfixCommits()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, ""))

        // Assert
        assertThat(metric.value()).isEqualTo(0L)
    }
}
