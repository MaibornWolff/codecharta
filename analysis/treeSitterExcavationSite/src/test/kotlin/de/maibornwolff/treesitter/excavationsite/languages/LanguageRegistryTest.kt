package de.maibornwolff.treesitter.excavationsite.languages

import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import org.assertj.core.api.Assertions.assertThatCode
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

class LanguageRegistryTest {
    @ParameterizedTest
    @EnumSource(Language::class)
    fun `should register a grammar and a definition for every language`(language: Language) {
        // Arrange
        val registry = LanguageRegistry

        // Act
        val lookUp = {
            registry.getGrammarLibrary(language)
            registry.getLanguageDefinition(language)
        }

        // Assert
        assertThatCode { lookUp() }.doesNotThrowAnyException()
    }
}
