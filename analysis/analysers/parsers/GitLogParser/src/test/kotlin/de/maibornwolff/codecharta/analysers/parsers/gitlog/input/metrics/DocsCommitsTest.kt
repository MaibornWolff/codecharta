package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class DocsCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = DocsCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_docs_commit() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: update documentation"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_docs_commit() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_docs_commits() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: update readme"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: add api docs"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "DOCS: update documentation"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Docs: add more docs"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  docs: update docs with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs(readme): update documentation"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Docs(api): add api documentation"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_match_flexible_format_with_space() {
        // given
        val metric = DocsCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs update readme"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Docs add new documentation"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }
}
