package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

/**
 * Loads the native grammar of every language on the platform the tests run on. CI runs this on every operating
 * system and architecture the native libraries are bundled for.
 */
class GrammarLoadingTest {
    @ParameterizedTest
    @CsvSource(
        "JAVA, program",
        "KOTLIN, source_file",
        "TYPESCRIPT, program",
        "TSX, program",
        "JAVASCRIPT, program",
        "PYTHON, module",
        "GO, source_file",
        "PHP, program",
        "RUBY, program",
        "SWIFT, source_file",
        "BASH, program",
        "CSHARP, compilation_unit",
        "CPP, translation_unit",
        "C, translation_unit",
        "OBJECTIVE_C, translation_unit",
        "VUE, program",
        "ABL, source_file",
        "DELPHI, root",
        "RUST, source_file"
    )
    fun `should load the native grammar and parse with it`(language: Language, expectedRootType: String) {
        // Arrange
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(language))

        // Act
        val rootType = FfmSyntaxTree.parse("x", grammar).use { it.rootNode.type }

        // Assert
        assertThat(rootType).isEqualTo(expectedRootType)
    }
}
