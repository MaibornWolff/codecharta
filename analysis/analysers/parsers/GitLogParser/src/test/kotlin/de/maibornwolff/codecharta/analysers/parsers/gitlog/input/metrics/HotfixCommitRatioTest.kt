package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class HotfixCommitRatioTest {
    private val hotfixType = DefaultSemanticCommitStyle.getTypeByName("hotfix")!!

    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = HotfixCommitRatio(hotfixType)

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_return_relative_attribute_type() {
        // when
        val metric = HotfixCommitRatio(hotfixType)

        // then
        assertThat(metric.attributeType()).isEqualTo(AttributeType.RELATIVE)
    }

    @Test
    fun should_calculate_ratio_for_all_hotfix_commits() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical security fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "apply hotfix for production"))

        // then
        assertThat(metric.value()).isEqualTo(1.0)
    }

    @Test
    fun should_calculate_ratio_for_mixed_commits() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: fix security vulnerability"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.5)
    }

    @Test
    fun should_calculate_ratio_for_no_hotfix_commits() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: bug fix"))

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_be_case_insensitive() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "HOTFIX: urgent security patch"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "Hotfix: critical bug fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.67)
    }

    @Test
    fun should_handle_whitespace_in_messages() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "  hotfix: urgent patch with whitespace  "))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.5)
    }

    @Test
    fun should_match_hotfix_anywhere_in_message() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "apply emergency hotfix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "production hotfix deployment"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "urgent hotfix for API"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.75)
    }

    @Test
    fun should_round_to_two_decimal_places() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: fix critical bug"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: update documentation"))

        // then
        assertThat(metric.value()).isEqualTo(0.33)
    }

    @Test
    fun should_match_flexible_format_with_parentheses() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix(api): fix critical endpoint"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix(security): hotfix for vulnerability"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.67)
    }

    @Test
    fun should_not_match_partial_words() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: photoshop fix"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add new feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_not_match_hyphenated_hotfix() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hot-fix: urgent production issue"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_handle_empty_message() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, ""))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add feature"))

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_handle_complex_ratio_calculation() {
        // given
        val metric = HotfixCommitRatio(hotfixType)

        // when
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "hotfix: critical security patch"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "emergency hotfix deployment"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "feat: add user authentication"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "fix: resolve login issue"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "docs: update API documentation"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "production hotfix for server crash"))
        metric.registerCommit(Commit("author", emptyList(), OffsetDateTime.now(), false, "test: add unit tests"))

        // then (3 hotfix out of 7 total = 0.43)
        assertThat(metric.value()).isEqualTo(0.43)
    }
}
