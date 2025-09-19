package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class StyleCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = StyleCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_style_commit() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style: format code"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_style_commit() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_style_commits() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style: format imports"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style: fix indentation"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "STYLE: format code"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Style: fix styling"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  style: format code with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style(format): fix formatting"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Style(lint): apply linting rules"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_match_flexible_format_with_space() {
        // given
        val metric = StyleCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "style fix formatting"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Style apply prettier"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }
}