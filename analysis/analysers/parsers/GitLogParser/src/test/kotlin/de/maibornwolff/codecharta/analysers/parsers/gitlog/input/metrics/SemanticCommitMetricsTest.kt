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
                Arguments.of(SemanticCommitMetric("docs", "Docs commits", SemanticCommitDetector::isDocsCommit), "docs", "docs: update documentation"),
                Arguments.of(SemanticCommitMetric("style", "Style commits", SemanticCommitDetector::isStyleCommit), "style", "style: format code"),
                Arguments.of(SemanticCommitMetric("refactor", "Refactor commits", SemanticCommitDetector::isRefactorCommit), "refactor", "refactor: improve code structure"),
                Arguments.of(SemanticCommitMetric("test", "Test commits", SemanticCommitDetector::isTestCommit), "test", "test: add unit tests"),
                Arguments.of(SemanticCommitMetric("feat", "Feat commits", SemanticCommitDetector::isFeatCommit), "feat", "feat: add new feature"),
                Arguments.of(SemanticCommitMetric("fix", "Fix commits", SemanticCommitDetector::isFixCommit), "fix", "fix: correct bug"),
                Arguments.of(SemanticCommitMetric("hotfix", "Hotfix commits", SemanticCommitDetector::isHotfixCommit), "hotfix", "hotfix: urgent fix")
            )
        }

        @JvmStatic
        fun semanticCommitMetricsWithMessages(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(SemanticCommitMetric("docs", "Docs commits", SemanticCommitDetector::isDocsCommit), "docs: update documentation"),
                Arguments.of(SemanticCommitMetric("style", "Style commits", SemanticCommitDetector::isStyleCommit), "style: format code"),
                Arguments.of(SemanticCommitMetric("refactor", "Refactor commits", SemanticCommitDetector::isRefactorCommit), "refactor: improve code structure"),
                Arguments.of(SemanticCommitMetric("test", "Test commits", SemanticCommitDetector::isTestCommit), "test: add unit tests"),
                Arguments.of(SemanticCommitMetric("feat", "Feat commits", SemanticCommitDetector::isFeatCommit), "feat: add new feature"),
                Arguments.of(SemanticCommitMetric("fix", "Fix commits", SemanticCommitDetector::isFixCommit), "fix: correct bug"),
                Arguments.of(SemanticCommitMetric("hotfix", "Hotfix commits", SemanticCommitDetector::isHotfixCommit), "hotfix: urgent fix")
            )
        }

        @JvmStatic
        fun semanticCommitMetricsWithParenthesesFormats(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(SemanticCommitMetric("docs", "Docs commits", SemanticCommitDetector::isDocsCommit), "docs(readme): update documentation"),
                Arguments.of(SemanticCommitMetric("style", "Style commits", SemanticCommitDetector::isStyleCommit), "style(format): fix formatting"),
                Arguments.of(SemanticCommitMetric("refactor", "Refactor commits", SemanticCommitDetector::isRefactorCommit), "refactor(core): improve structure"),
                Arguments.of(SemanticCommitMetric("test", "Test commits", SemanticCommitDetector::isTestCommit), "test(unit): add tests"),
                Arguments.of(SemanticCommitMetric("feat", "Feat commits", SemanticCommitDetector::isFeatCommit), "feat(api): add endpoint"),
                Arguments.of(SemanticCommitMetric("fix", "Fix commits", SemanticCommitDetector::isFixCommit), "fix(auth): correct login"),
                Arguments.of(SemanticCommitMetric("hotfix", "Hotfix commits", SemanticCommitDetector::isHotfixCommit), "hotfix(security): patch vulnerability")
            )
        }

        @JvmStatic
        fun semanticCommitMetricsWithSpaceFormats(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(SemanticCommitMetric("docs", "Docs commits", SemanticCommitDetector::isDocsCommit), "docs update readme"),
                Arguments.of(SemanticCommitMetric("style", "Style commits", SemanticCommitDetector::isStyleCommit), "style fix code"),
                Arguments.of(SemanticCommitMetric("refactor", "Refactor commits", SemanticCommitDetector::isRefactorCommit), "refactor improve code"),
                Arguments.of(SemanticCommitMetric("test", "Test commits", SemanticCommitDetector::isTestCommit), "test add coverage"),
                Arguments.of(SemanticCommitMetric("feat", "Feat commits", SemanticCommitDetector::isFeatCommit), "feat add feature"),
                Arguments.of(SemanticCommitMetric("fix", "Fix commits", SemanticCommitDetector::isFixCommit), "fix resolve issue"),
                Arguments.of(SemanticCommitMetric("hotfix", "Hotfix commits", SemanticCommitDetector::isHotfixCommit), "hotfix urgent repair")
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
                false,
                parenthesesMessage
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
                false,
                spaceMessage
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
            SemanticCommitMetric("docs", "Docs commits", SemanticCommitDetector::isDocsCommit) to "docs_commits",
            SemanticCommitMetric("style", "Style commits", SemanticCommitDetector::isStyleCommit) to "style_commits",
            SemanticCommitMetric("refactor", "Refactor commits", SemanticCommitDetector::isRefactorCommit) to "refactor_commits",
            SemanticCommitMetric("test", "Test commits", SemanticCommitDetector::isTestCommit) to "test_commits",
            SemanticCommitMetric("feat", "Feat commits", SemanticCommitDetector::isFeatCommit) to "feat_commits",
            SemanticCommitMetric("fix", "Fix commits", SemanticCommitDetector::isFixCommit) to "fix_commits",
            SemanticCommitMetric("hotfix", "Hotfix commits", SemanticCommitDetector::isHotfixCommit) to "hotfix_commits"
        )

        metrics.forEach { (metric, expectedName) ->
            assertThat(metric.metricName()).isEqualTo(expectedName)
            assertThat(metric.description()).isNotBlank()
        }
    }
}
