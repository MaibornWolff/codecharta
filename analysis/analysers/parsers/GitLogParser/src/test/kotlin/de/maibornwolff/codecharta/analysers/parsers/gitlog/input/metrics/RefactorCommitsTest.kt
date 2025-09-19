package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class RefactorCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = RefactorCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_refactor_commit() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor: improve code structure"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_refactor_commit() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_refactor_commits() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor: extract method"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor: simplify logic"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "REFACTOR: improve structure"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Refactor: cleanup code"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  refactor: improve with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor(core): improve structure"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Refactor(utils): extract utilities"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_match_flexible_format_with_space() {
        // given
        val metric = RefactorCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "refactor improve code"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Refactor cleanup methods"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }
}