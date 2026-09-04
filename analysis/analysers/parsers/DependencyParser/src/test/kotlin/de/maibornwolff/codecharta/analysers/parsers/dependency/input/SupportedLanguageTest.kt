package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SupportedLanguageTest {
    @Test
    fun `should detect a language from a file name`() {
        // Act + Assert
        assertThat(SupportedLanguage.ofFileName("Main.kt")).isEqualTo(SupportedLanguage.KOTLIN)
        assertThat(SupportedLanguage.ofFileName("main.go")).isEqualTo(SupportedLanguage.GO)
        assertThat(SupportedLanguage.ofFileName("App.vue")).isEqualTo(SupportedLanguage.VUE)
    }

    @Test
    fun `should detect a language regardless of how the extension is cased`() {
        // Act + Assert
        assertThat(SupportedLanguage.ofFileName("Main.KT")).isEqualTo(SupportedLanguage.KOTLIN)
    }

    @Test
    fun `should detect no language for an unsupported or missing extension`() {
        // Act + Assert
        assertThat(SupportedLanguage.ofFileName("README.md")).isNull()
        assertThat(SupportedLanguage.ofFileName("Makefile")).isNull()
    }

    @Test
    fun `should group the extensions CodeCharta splits by grammar but dependency analysis treats as one language`() {
        // Assert: TSX has its own grammar entry, C has its own — both are analysed by the sibling language.
        assertThat(SupportedLanguage.ofFileName("Component.tsx")).isEqualTo(SupportedLanguage.TYPESCRIPT)
        assertThat(SupportedLanguage.ofFileName("legacy.c")).isEqualTo(SupportedLanguage.CPP)
        assertThat(SupportedLanguage.ofFileName("legacy.h")).isEqualTo(SupportedLanguage.CPP)
    }

    @Test
    fun `should carry every extension of the FileExtension entries it is built from`() {
        // Assert: the enum is the single source of extensions, so a new one there reaches the scanner.
        assertThat(SupportedLanguage.TYPESCRIPT.suffixes)
            .containsExactlyInAnyOrderElementsOf(
                (
                    listOf(FileExtension.TYPESCRIPT.primaryExtension) + FileExtension.TYPESCRIPT.otherValidExtensions +
                        listOf(FileExtension.TSX.primaryExtension) + FileExtension.TSX.otherValidExtensions
                ).map { it.removePrefix(".") }
            )
    }

    @Test
    fun `should expose every suffix without a leading dot`() {
        // Assert
        assertThat(SupportedLanguage.allSuffixes()).allSatisfy { suffix -> assertThat(suffix).doesNotStartWith(".") }
    }

    @Test
    fun `should map each suffix to exactly one language`() {
        // Arrange
        val allSuffixes = SupportedLanguage.entries.flatMap { it.suffixes }

        // Assert: an ambiguous suffix would make language detection order-dependent.
        assertThat(allSuffixes).doesNotHaveDuplicates()
    }
}
