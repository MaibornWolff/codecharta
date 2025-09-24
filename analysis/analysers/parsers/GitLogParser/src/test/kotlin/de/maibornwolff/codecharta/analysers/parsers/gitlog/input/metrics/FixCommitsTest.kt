package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class FixCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = FixCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_fix_commit() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix critical bug"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_fix_commit() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_fix_commits() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix bug 1"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: fix bug 2"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "FIX: fix bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Fix: fix another bug"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  fix: fix bug with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix(api): fix endpoint bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Fix(core): fix critical issue"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_match_flexible_format_with_space() {
        // given
        val metric = FixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix critical bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Fix another issue"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }
}
