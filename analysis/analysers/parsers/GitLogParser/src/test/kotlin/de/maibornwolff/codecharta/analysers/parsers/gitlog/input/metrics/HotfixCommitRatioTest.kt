package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class HotfixCommitRatioTest {
    @Test
    fun should_have_initial_value_zero() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act & Assert
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_return_correct_metric_name() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act & Assert
        assertThat(metric.metricName()).isEqualTo("hotfix_commit_ratio")
    }

    @Test
    fun should_return_correct_description() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act & Assert
        assertThat(
            metric.description()
        ).isEqualTo("Hotfix Commit Ratio: Ratio of hotfix commits (containing 'hotfix') to total commits for this file.")
    }

    @Test
    fun should_have_relative_attribute_type() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act & Assert
        assertThat(metric.attributeType()).isEqualTo(AttributeType.RELATIVE)
    }

    @Test
    fun should_return_1_when_all_commits_are_hotfix() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: another fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(1.0)
    }

    @Test
    fun should_return_0_when_no_commits_are_hotfix() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: bug fix"))

        // Assert
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_calculate_correct_ratio() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: bug fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: another fix"))

        // Assert
        // 2 hotfix commits out of 4 total = 0.5
        assertThat(metric.value()).isEqualTo(0.5)
    }

    @Test
    fun should_round_to_two_decimal_places() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix"))

        // Assert
        // 1 hotfix out of 3 total = 0.333... rounded to 0.33
        assertThat(metric.value()).isEqualTo(0.33)
    }

    @Test
    fun should_handle_case_insensitive_matching() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: lowercase"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "HOTFIX: uppercase"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: feature"))

        // Assert
        // 2 hotfix out of 3 total = 0.67 (rounded)
        assertThat(metric.value()).isEqualTo(0.67)
    }

    @Test
    fun should_match_hotfix_anywhere_in_message() {
        // Arrange
        val metric = HotfixCommitRatio()

        // Act
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: this is a hotfix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: feature"))

        // Assert
        // 2 hotfix out of 3 total = 0.67 (rounded)
        assertThat(metric.value()).isEqualTo(0.67)
    }
}
