package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SemanticCommitDetectorTest {
    @Test
    fun should_detect_feat_commits() {
        assertThat(SemanticCommitDetector.isFeatCommit("feat: add new feature")).isTrue
        assertThat(SemanticCommitDetector.isFeatCommit("FEAT: add feature")).isTrue
        assertThat(SemanticCommitDetector.isFeatCommit("  feat: trimmed message  ")).isTrue
        assertThat(SemanticCommitDetector.isFeatCommit("feat(api): add endpoint")).isTrue
        assertThat(SemanticCommitDetector.isFeatCommit("feat add feature")).isTrue
        assertThat(SemanticCommitDetector.isFeatCommit("fix: not feat")).isFalse
        assertThat(SemanticCommitDetector.isFeatCommit("feature: not feat")).isTrue
    }

    @Test
    fun should_detect_fix_commits() {
        assertThat(SemanticCommitDetector.isFixCommit("fix: fix bug")).isTrue
        assertThat(SemanticCommitDetector.isFixCommit("FIX: fix bug")).isTrue
        assertThat(SemanticCommitDetector.isFixCommit("  fix: trimmed message  ")).isTrue
        assertThat(SemanticCommitDetector.isFixCommit("fix(core): fix bug")).isTrue
        assertThat(SemanticCommitDetector.isFixCommit("fix bug")).isTrue
        assertThat(SemanticCommitDetector.isFixCommit("feat: not fix")).isFalse
        assertThat(SemanticCommitDetector.isFixCommit("fixes: not fix")).isTrue
    }

    @Test
    fun should_detect_docs_commits() {
        assertThat(SemanticCommitDetector.isDocsCommit("docs: update documentation")).isTrue
        assertThat(SemanticCommitDetector.isDocsCommit("DOCS: update docs")).isTrue
        assertThat(SemanticCommitDetector.isDocsCommit("  docs: trimmed message  ")).isTrue
        assertThat(SemanticCommitDetector.isDocsCommit("docs(readme): update")).isTrue
        assertThat(SemanticCommitDetector.isDocsCommit("docs update")).isTrue
        assertThat(SemanticCommitDetector.isDocsCommit("feat: not docs")).isFalse
        assertThat(SemanticCommitDetector.isDocsCommit("documentation: not docs")).isFalse
    }

    @Test
    fun should_detect_style_commits() {
        assertThat(SemanticCommitDetector.isStyleCommit("style: format code")).isTrue
        assertThat(SemanticCommitDetector.isStyleCommit("STYLE: format code")).isTrue
        assertThat(SemanticCommitDetector.isStyleCommit("  style: trimmed message  ")).isTrue
        assertThat(SemanticCommitDetector.isStyleCommit("style(lint): fix formatting")).isTrue
        assertThat(SemanticCommitDetector.isStyleCommit("style format")).isTrue
        assertThat(SemanticCommitDetector.isStyleCommit("feat: not style")).isFalse
        assertThat(SemanticCommitDetector.isStyleCommit("styling: not style")).isFalse
    }

    @Test
    fun should_detect_refactor_commits() {
        assertThat(SemanticCommitDetector.isRefactorCommit("refactor: restructure code")).isTrue
        assertThat(SemanticCommitDetector.isRefactorCommit("REFACTOR: restructure")).isTrue
        assertThat(SemanticCommitDetector.isRefactorCommit("  refactor: trimmed message  ")).isTrue
        assertThat(SemanticCommitDetector.isRefactorCommit("refactor(core): clean up")).isTrue
        assertThat(SemanticCommitDetector.isRefactorCommit("refactor code")).isTrue
        assertThat(SemanticCommitDetector.isRefactorCommit("feat: not refactor")).isFalse
        assertThat(SemanticCommitDetector.isRefactorCommit("refactoring: not refactor")).isTrue
    }

    @Test
    fun should_detect_test_commits() {
        assertThat(SemanticCommitDetector.isTestCommit("test: add unit tests")).isTrue
        assertThat(SemanticCommitDetector.isTestCommit("TEST: add tests")).isTrue
        assertThat(SemanticCommitDetector.isTestCommit("  test: trimmed message  ")).isTrue
        assertThat(SemanticCommitDetector.isTestCommit("test(api): add integration tests")).isTrue
        assertThat(SemanticCommitDetector.isTestCommit("test coverage")).isTrue
        assertThat(SemanticCommitDetector.isTestCommit("feat: not test")).isFalse
        assertThat(SemanticCommitDetector.isTestCommit("testing: not test")).isTrue
    }

    @Test
    fun should_detect_hotfix_commits() {
        assertThat(SemanticCommitDetector.isHotfixCommit("hotfix: critical security fix")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("HOTFIX: urgent patch")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("apply emergency hotfix")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("production hotfix deployment")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("urgent hotfix for API")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("hotfix(api): fix endpoint")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("fix(security): hotfix vulnerability")).isTrue
        assertThat(SemanticCommitDetector.isHotfixCommit("feat: add feature")).isFalse
        assertThat(SemanticCommitDetector.isHotfixCommit("fix: photoshop fix")).isFalse
        assertThat(SemanticCommitDetector.isHotfixCommit("hot-fix: hyphenated")).isFalse
        assertThat(SemanticCommitDetector.isHotfixCommit("")).isFalse
    }

    @Test
    fun should_detect_semantic_commits() {
        assertThat(SemanticCommitDetector.isSemanticCommit("feat: add feature")).isTrue
        assertThat(SemanticCommitDetector.isSemanticCommit("fix: fix bug")).isTrue
        assertThat(SemanticCommitDetector.isSemanticCommit("docs: update docs")).isTrue
        assertThat(SemanticCommitDetector.isSemanticCommit("style: format code")).isTrue
        assertThat(SemanticCommitDetector.isSemanticCommit("refactor: restructure")).isTrue
        assertThat(SemanticCommitDetector.isSemanticCommit("test: add tests")).isTrue
        assertThat(SemanticCommitDetector.isSemanticCommit("random commit")).isFalse
        assertThat(SemanticCommitDetector.isSemanticCommit("build: not semantic")).isFalse
        assertThat(SemanticCommitDetector.isSemanticCommit("chore: not semantic")).isFalse
    }
}
