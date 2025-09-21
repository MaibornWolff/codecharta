package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class TestCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = TestCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_test_commit() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add unit tests"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_not_increase_for_non_test_commit() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_for_multiple_test_commits() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add unit tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add integration tests"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "TEST: add unit tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Test: add more tests"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_handle_whitespace_in_message() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  test: add tests with whitespace  "))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test(unit): add unit tests"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Test(integration): add integration tests"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_match_flexible_format_with_space() {
        // given
        val metric = TestCommits()

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test add coverage"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Test improve assertions"))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }
}
