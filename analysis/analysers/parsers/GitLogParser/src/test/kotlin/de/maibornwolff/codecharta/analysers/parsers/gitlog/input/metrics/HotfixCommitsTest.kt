package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class HotfixCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = HotfixCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_hotfix_commit() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical security fix"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_hotfix_commit() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_hotfix_commits() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: fix security vulnerability"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Apply hotfix for production issue"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "HOTFIX: urgent security patch"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Hotfix: critical bug fix"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  hotfix: urgent patch with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_hotfix_anywhere_in_message() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "apply emergency hotfix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "production hotfix deployment"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "urgent hotfix for API"))

        // then
        assertThat(metric.value()).isEqualTo(3L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix(api): fix critical endpoint"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix(security): hotfix for vulnerability"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_not_match_partial_words() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: photoshop fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_match_hyphenated_hotfix() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hot-fix: urgent production issue"))

        // then
        assertThat(metric.value()).isEqualTo(0L) // should not match hyphenated version
    }

    @Test
    fun should_handle_empty_message() {
        // given
        val metric = HotfixCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, ""))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }
}
