package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class FeatCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = FeatCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_feat_commit() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_feat_commit() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix bug"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_feat_commits() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature 1"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature 2"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "FEAT: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Feat: add another feature"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  feat: add feature with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat(api): add new endpoint"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Feat(core): implement feature"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_match_flexible_format_with_space() {
        // given
        val metric = FeatCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat add new feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Feat implement another feature"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }
}
