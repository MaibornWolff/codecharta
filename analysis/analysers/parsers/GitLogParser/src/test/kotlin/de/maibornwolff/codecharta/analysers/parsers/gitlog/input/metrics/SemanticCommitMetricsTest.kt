package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.time.OffsetDateTime
import java.util.stream.Stream

class SemanticCommitMetricsTest {
    companion object {
        @JvmStatic
        fun semanticCommitMetrics(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(DocsCommits(), "docs", "docs: update documentation"),
                Arguments.of(StyleCommits(), "style", "style: format code"),
                Arguments.of(RefactorCommits(), "refactor", "refactor: improve code structure"),
                Arguments.of(TestCommits(), "test", "test: add unit tests")
            )
        }

        @JvmStatic
        fun semanticCommitMetricsWithMessages(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(DocsCommits(), "docs: update documentation"),
                Arguments.of(StyleCommits(), "style: format code"),
                Arguments.of(RefactorCommits(), "refactor: improve code structure"),
                Arguments.of(TestCommits(), "test: add unit tests")
            )
        }

        @JvmStatic
        fun semanticCommitMetricsWithParenthesesFormats(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(DocsCommits(), "docs(readme): update documentation"),
                Arguments.of(StyleCommits(), "style(format): fix formatting"),
                Arguments.of(RefactorCommits(), "refactor(core): improve structure"),
                Arguments.of(TestCommits(), "test(unit): add tests")
            )
        }

        @JvmStatic
        fun semanticCommitMetricsWithSpaceFormats(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(DocsCommits(), "docs update readme"),
                Arguments.of(StyleCommits(), "style fix code"),
                Arguments.of(RefactorCommits(), "refactor improve code"),
                Arguments.of(TestCommits(), "test add coverage")
            )
        }
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetrics")
    fun should_have_initial_value_zero(metric: Metric) {
        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetricsWithMessages")
    fun should_increase_for_matching_commit(metric: Metric, sampleMessage: String) {
        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, sampleMessage))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetrics")
    fun should_not_increase_for_non_matching_commit(metric: Metric) {
        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetrics")
    fun should_be_case_insensitive(metric: Metric, expectedType: String, sampleMessage: String) {
        // when
        val upperCaseMessage = sampleMessage.replaceFirst(expectedType, expectedType.uppercase())
        val titleCaseMessage = sampleMessage.replaceFirst(expectedType, expectedType.replaceFirstChar { it.uppercase() })

        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, upperCaseMessage))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, titleCaseMessage))

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetricsWithMessages")
    fun should_handle_whitespace_in_message(metric: Metric, sampleMessage: String) {
        // when
        val messageWithWhitespace = "  $sampleMessage  "
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, messageWithWhitespace))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetricsWithParenthesesFormats")
    fun should_match_flexible_format_with_parentheses(metric: Metric, parenthesesMessage: String) {
        // when
        metric.registerCommit(
            Commit(
                "author",
                emptyList(),
                OffsetDateTime.now(),
                false, parenthesesMessage
            )
        )
        metric.registerCommit(
            Commit(
                "author",
                emptyList(),
                OffsetDateTime.now(),
                false,
                parenthesesMessage.replaceFirstChar { it.uppercase() }
            )
        )

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @ParameterizedTest
    @MethodSource("semanticCommitMetricsWithSpaceFormats")
    fun should_match_flexible_format_with_space(metric: Metric, spaceMessage: String) {
        // when
        metric.registerCommit(
            Commit(
                "author",
                emptyList(),
                OffsetDateTime.now(),
                false, spaceMessage
            )
        )
        metric.registerCommit(
            Commit(
            "author",
            emptyList(),
            OffsetDateTime.now(),
            false,
            spaceMessage.replaceFirstChar { it.uppercase() }
            )
        )

        // then
        assertThat(metric.value()).isEqualTo(2L)
    }

    @Test
    fun should_have_correct_metric_names_and_descriptions() {
        val metrics = listOf(
            DocsCommits() to "docs_commits",
            StyleCommits() to "style_commits",
            RefactorCommits() to "refactor_commits",
            TestCommits() to "test_commits"
        )

        metrics.forEach { (metric, expectedName) ->
            assertThat(metric.metricName()).isEqualTo(expectedName)
            assertThat(metric.description()).isNotBlank()
        }
    }
}
