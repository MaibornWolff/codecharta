package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class DefaultSemanticCommitStyleTest {
    private val commitTypes = DefaultSemanticCommitStyle.getAllTypes()

    @Test
    fun should_return_all_default_commit_types() {
        // Arrange & Act
        val types = DefaultSemanticCommitStyle.getAllTypes()

        // Assert
        assertThat(types).hasSize(6)
        assertThat(types.map { it.name }).containsExactlyInAnyOrder(
            "feat",
            "fix",
            "docs",
            "style",
            "refactor",
            "test"
        )
    }

    @ParameterizedTest
    @CsvSource(
        "feat, feat: add new feature, true",
        "feat, FEAT: add feature, true",
        "feat, '  feat: trimmed message  ', true",
        "feat, feat(api): add endpoint, true",
        "feat, feat add feature, true",
        "feat, fix: not feat, false",
        "feat, feature: not feat, true",
        "fix, fix: fix bug, true",
        "fix, FIX: fix bug, true",
        "fix, '  fix: trimmed message  ', true",
        "fix, fix(core): fix bug, true",
        "fix, fix bug, true",
        "fix, feat: not fix, false",
        "fix, fixes: not fix, true",
        "docs, docs: update documentation, true",
        "docs, DOCS: update docs, true",
        "docs, '  docs: trimmed message  ', true",
        "docs, docs(readme): update, true",
        "docs, docs update, true",
        "docs, feat: not docs, false",
        "docs, documentation: not docs, false",
        "style, style: format code, true",
        "style, STYLE: format code, true",
        "style, '  style: trimmed message  ', true",
        "style, style(lint): fix formatting, true",
        "style, style format, true",
        "style, feat: not style, false",
        "style, styling: not style, false",
        "refactor, refactor: restructure code, true",
        "refactor, REFACTOR: restructure, true",
        "refactor, '  refactor: trimmed message  ', true",
        "refactor, refactor(core): clean up, true",
        "refactor, refactor code, true",
        "refactor, feat: not refactor, false",
        "refactor, refactoring: not refactor, true",
        "test, test: add unit tests, true",
        "test, TEST: add tests, true",
        "test, '  test: trimmed message  ', true",
        "test, test(api): add integration tests, true",
        "test, test coverage, true",
        "test, feat: not test, false",
        "test, testing: not test, true"
    )
    fun should_match_commit_types_correctly(typeName: String, message: String, expectedMatch: Boolean) {
        // Arrange
        val commitType = commitTypes.find { it.name == typeName }!!

        // Act
        val matches = commitType.matchPattern.matches(message)

        // Assert
        assertThat(matches).isEqualTo(expectedMatch)
    }
}
