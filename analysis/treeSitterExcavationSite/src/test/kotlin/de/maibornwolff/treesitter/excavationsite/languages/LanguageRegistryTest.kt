package de.maibornwolff.treesitter.excavationsite.languages

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LanguageRegistryTest {
    @Test
    fun `should register a grammar and a definition for every language`() {
        // Arrange
        val languages = Language.entries

        // Act
        val registered = languages.filter {
            runCatching {
                LanguageRegistry.getGrammarLibrary(it)
                LanguageRegistry.getLanguageDefinition(it)
            }.isSuccess
        }

        // Assert
        assertThat(registered).containsExactlyElementsOf(languages)
    }

    @Test
    fun `should give languages that share or rename a grammar the library they load`() {
        // Arrange
        val languages = listOf(Language.VUE, Language.CSHARP, Language.DELPHI, Language.SQL)

        // Act
        val libraries = languages.map { LanguageRegistry.getGrammarLibrary(it) }

        // Assert
        assertThat(libraries).containsExactly(
            GrammarLibrary("javascript"),
            GrammarLibrary("c-sharp", "c_sharp"),
            GrammarLibrary("pascal"),
            GrammarLibrary("sql-island", "sql_island")
        )
    }
}
