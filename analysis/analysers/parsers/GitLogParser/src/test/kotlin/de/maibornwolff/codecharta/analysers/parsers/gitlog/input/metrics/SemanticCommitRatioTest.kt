package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class SemanticCommitRatioTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = SemanticCommitRatio()

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_return_relative_attribute_type() {
        // when
        val metric = SemanticCommitRatio()

        // then
        assertThat(metric.attributeType()).isEqualTo(AttributeType.RELATIVE)
    }

    @Test
    fun should_calculate_ratio_for_all_semantic_commits() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix bug"))

        // then
        assertThat(metric.value()).isEqualTo(1.0)
    }

    @Test
    fun should_calculate_ratio_for_mixed_commits() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.5)
    }

    @Test
    fun should_calculate_ratio_for_no_semantic_commits() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "another commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_count_all_semantic_commit_types() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: update docs"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style: format code"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor: restructure"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.86)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "FEAT: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Fix: fix bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.67)
    }

    @Test
    fun should_handle_whitespace_in_messages() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  feat: add feature  "))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "\tfix: fix bug\t"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.67)
    }

    @Test
    fun should_round_to_two_decimal_places() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit 1"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit 2"))

        // then
        assertThat(metric.value()).isEqualTo(0.33)
    }

    @Test
    fun should_handle_flexible_format_with_parentheses() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat(api): add new endpoint"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix(core): fix critical bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.67)
    }

    @Test
    fun should_handle_flexible_format_with_space() {
        // given
        val metric = SemanticCommitRatio()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat add new feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test add unit tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "random commit"))

        // then
        assertThat(metric.value()).isEqualTo(0.67)
    }
}
