package de.maibornwolff.treesitter.excavationsite.api.contract

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

/**
 * Loads the native grammar of every language on the platform the tests run on. CI runs this on every operating
 * system and architecture the native libraries are bundled for.
 */
class GrammarLoadingContractTest {
    @ParameterizedTest
    @EnumSource(Language::class)
    fun `should load the native grammar and parse with it`(language: Language) {
        // Arrange
        val code = "x"

        // Act
        val result = TreeSitterMetrics.parse(code, language)

        // Assert
        assertThat(result.metrics).containsKey("loc")
    }
}
