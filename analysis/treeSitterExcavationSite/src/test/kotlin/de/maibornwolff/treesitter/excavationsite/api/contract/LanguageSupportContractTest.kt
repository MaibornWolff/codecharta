package de.maibornwolff.treesitter.excavationsite.api.contract

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

/**
 * Contract tests for language support stability.
 * These tests verify that file extensions map to correct languages.
 * Failures indicate a language mapping was changed or removed.
 */
class LanguageSupportContractTest {
    @Nested
    inner class PrimaryExtensionMappingContract {
        @ParameterizedTest
        @CsvSource(
            ".java, JAVA",
            ".kt, KOTLIN",
            ".ts, TYPESCRIPT",
            ".js, JAVASCRIPT",
            ".py, PYTHON",
            ".go, GO",
            ".php, PHP",
            ".rb, RUBY",
            ".swift, SWIFT",
            ".sh, BASH",
            ".cs, CSHARP",
            ".cpp, CPP",
            ".c, C",
            ".m, OBJECTIVE_C",
            ".pas, DELPHI",
            ".rs, RUST"
        )
        fun `should map primary extension to correct language`(extension: String, expectedLanguage: String) {
            // Act
            val language = Language.fromExtension(extension)

            // Assert
            assertThat(language?.name).isEqualTo(expectedLanguage)
        }
    }

    @Nested
    inner class SecondaryExtensionMappingContract {
        @Test
        fun `should map kts extension to KOTLIN`() {
            // Assert
            assertThat(Language.fromExtension(".kts")).isEqualTo(Language.KOTLIN)
        }

        @Test
        fun `should map tsx extension to TSX`() {
            // Assert
            assertThat(Language.fromExtension(".tsx")).isEqualTo(Language.TSX)
        }

        @Test
        fun `should map jsx extension to JAVASCRIPT`() {
            // Assert
            assertThat(Language.fromExtension(".jsx")).isEqualTo(Language.JAVASCRIPT)
        }

        @Test
        fun `should map mjs extension to JAVASCRIPT`() {
            // Assert
            assertThat(Language.fromExtension(".mjs")).isEqualTo(Language.JAVASCRIPT)
        }

        @Test
        fun `should map cjs extension to JAVASCRIPT`() {
            // Assert
            assertThat(Language.fromExtension(".cjs")).isEqualTo(Language.JAVASCRIPT)
        }

        @Test
        fun `should map bash extension to BASH`() {
            // Assert
            assertThat(Language.fromExtension(".bash")).isEqualTo(Language.BASH)
        }

        @Test
        fun `should map cc extension to CPP`() {
            // Assert
            assertThat(Language.fromExtension(".cc")).isEqualTo(Language.CPP)
        }

        @Test
        fun `should map cxx extension to CPP`() {
            // Assert
            assertThat(Language.fromExtension(".cxx")).isEqualTo(Language.CPP)
        }

        @Test
        fun `should map hpp extension to CPP`() {
            // Assert
            assertThat(Language.fromExtension(".hpp")).isEqualTo(Language.CPP)
        }

        @Test
        fun `should map hxx extension to CPP`() {
            // Assert
            assertThat(Language.fromExtension(".hxx")).isEqualTo(Language.CPP)
        }

        @Test
        fun `should map h extension to CPP`() {
            // Assert
            assertThat(Language.fromExtension(".h")).isEqualTo(Language.CPP)
        }

        @Test
        fun `should map mm extension to OBJECTIVE_C`() {
            // Assert
            assertThat(Language.fromExtension(".mm")).isEqualTo(Language.OBJECTIVE_C)
        }

        @Test
        fun `should map dpr extension to DELPHI`() {
            // Assert
            assertThat(Language.fromExtension(".dpr")).isEqualTo(Language.DELPHI)
        }
    }

    @Nested
    inner class IsLanguageSupportedContract {
        @ParameterizedTest
        @CsvSource(
            ".java",
            ".kt",
            ".kts",
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            ".mjs",
            ".cjs",
            ".py",
            ".go",
            ".php",
            ".rb",
            ".swift",
            ".sh",
            ".bash",
            ".cs",
            ".cpp",
            ".cc",
            ".cxx",
            ".hpp",
            ".hxx",
            ".h",
            ".c",
            ".m",
            ".mm",
            ".pas",
            ".dpr",
            ".rs"
        )
        fun `should return true for supported extensions`(extension: String) {
            // Assert
            assertThat(TreeSitterMetrics.isLanguageSupported(extension))
                .withFailMessage("Expected extension $extension to be supported")
                .isTrue()
        }

        @Test
        fun `should return false for unsupported extensions`() {
            // Assert
            assertThat(TreeSitterMetrics.isLanguageSupported(".unknown")).isFalse()
            assertThat(TreeSitterMetrics.isLanguageSupported(".xyz")).isFalse()
            assertThat(TreeSitterMetrics.isLanguageSupported("")).isFalse()
        }
    }

    @Nested
    inner class GetLanguageContract {
        @Test
        fun `should return language for supported extension`() {
            // Assert
            assertThat(TreeSitterMetrics.getLanguage(".java")).isEqualTo(Language.JAVA)
            assertThat(TreeSitterMetrics.getLanguage(".kt")).isEqualTo(Language.KOTLIN)
            assertThat(TreeSitterMetrics.getLanguage(".py")).isEqualTo(Language.PYTHON)
        }

        @Test
        fun `should return null for unsupported extension`() {
            // Assert
            assertThat(TreeSitterMetrics.getLanguage(".unknown")).isNull()
            assertThat(TreeSitterMetrics.getLanguage(".xyz")).isNull()
        }
    }

    @Nested
    inner class GetSupportedExtensionsContract {
        @Test
        fun `should return all primary extensions`() {
            // Act
            val extensions = TreeSitterMetrics.getSupportedExtensions()

            // Assert
            assertThat(extensions).contains(
                ".java",
                ".kt",
                ".ts",
                ".js",
                ".py",
                ".go",
                ".php",
                ".rb",
                ".swift",
                ".sh",
                ".cs",
                ".cpp",
                ".c",
                ".m"
            )
        }

        @Test
        fun `should return secondary extensions`() {
            // Act
            val extensions = TreeSitterMetrics.getSupportedExtensions()

            // Assert
            assertThat(extensions).contains(
                ".kts",
                ".tsx",
                ".jsx",
                ".mjs",
                ".cjs",
                ".bash",
                ".cc",
                ".cxx",
                ".hpp",
                ".hxx",
                ".h",
                ".mm"
            )
        }

        @Test
        fun `should return at least 28 extensions`() {
            // Act
            val extensions = TreeSitterMetrics.getSupportedExtensions()

            // Assert - 15 primary + 13 secondary = 28 total
            assertThat(extensions.size).isGreaterThanOrEqualTo(28)
        }
    }

    @Nested
    inner class ExtractionSupportContract {
        @Test
        fun `should support extraction for all languages`() {
            // Assert
            Language.entries.forEach { language ->
                assertThat(TreeSitterExtraction.isExtractionSupported(language))
                    .withFailMessage("Expected extraction to be supported for ${language.name}")
                    .isTrue()
            }
        }

        @Test
        fun `should return all languages as supported for extraction`() {
            // Act
            val supportedLanguages = TreeSitterExtraction.getSupportedLanguages()

            // Assert
            assertThat(supportedLanguages).containsExactlyInAnyOrderElementsOf(Language.entries.toList())
        }

        @Test
        fun `should return same extensions for extraction and metrics`() {
            // Act
            val metricsExtensions = TreeSitterMetrics.getSupportedExtensions()
            val extractionExtensions = TreeSitterExtraction.getSupportedExtensions()

            // Assert
            assertThat(extractionExtensions).containsExactlyInAnyOrderElementsOf(metricsExtensions)
        }
    }

    @Nested
    inner class DependencySupportContract {
        @Test
        fun `should return supported dependency analysis languages`() {
            // Act & Assert
            assertThat(TreeSitterDependencies.getSupportedLanguages())
                .containsExactlyInAnyOrder(
                    Language.JAVA,
                    Language.KOTLIN,
                    Language.CSHARP,
                    Language.CPP,
                    Language.DELPHI,
                    Language.TYPESCRIPT,
                    Language.JAVASCRIPT,
                    Language.TSX,
                    Language.RUST
                )
        }
    }

    @Nested
    inner class LanguagePropertiesContract {
        @Test
        fun `should have primaryExtension for all languages`() {
            // Assert
            Language.entries.forEach { language ->
                assertThat(language.primaryExtension)
                    .withFailMessage("${language.name} should have a primaryExtension")
                    .isNotEmpty()
                    .startsWith(".")
            }
        }

        @Test
        fun `should have otherExtensions property for all languages`() {
            // Assert
            Language.entries.forEach { language ->
                assertThat(language.otherExtensions)
                    .withFailMessage("${language.name} should have otherExtensions (can be empty)")
                    .isNotNull()
            }
        }
    }
}
