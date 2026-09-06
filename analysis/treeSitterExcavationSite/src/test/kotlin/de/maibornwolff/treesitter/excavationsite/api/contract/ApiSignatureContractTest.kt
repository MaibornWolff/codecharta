package de.maibornwolff.treesitter.excavationsite.api.contract

import de.maibornwolff.treesitter.excavationsite.api.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.api.ExtractionResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.MetricsResult
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.io.File

/**
 * Contract tests to prevent breaking changes to the public API.
 * These tests verify that all public methods exist with expected signatures.
 * Failures indicate a breaking API change that needs acknowledgment.
 */
class ApiSignatureContractTest {
    @Nested
    inner class TreeSitterMetricsApiContract {
        @Test
        fun `should have parse method accepting File`() {
            // Arrange
            val method = TreeSitterMetrics::class.java.getMethod("parse", File::class.java)

            // Assert
            assertThat(method.returnType).isEqualTo(MetricsResult::class.java)
        }

        @Test
        fun `should have parse method accepting String and Language`() {
            // Arrange
            val method = TreeSitterMetrics::class.java.getMethod(
                "parse",
                String::class.java,
                Language::class.java
            )

            // Assert
            assertThat(method.returnType).isEqualTo(MetricsResult::class.java)
        }

        @Test
        fun `should have isLanguageSupported method accepting String`() {
            // Arrange
            val method = TreeSitterMetrics::class.java.getMethod(
                "isLanguageSupported",
                String::class.java
            )

            // Assert
            assertThat(method.returnType).isEqualTo(Boolean::class.java)
        }

        @Test
        fun `should have getLanguage method accepting String`() {
            // Arrange
            val method = TreeSitterMetrics::class.java.getMethod(
                "getLanguage",
                String::class.java
            )

            // Assert
            assertThat(method.returnType).isEqualTo(Language::class.java)
        }

        @Test
        fun `should have getSupportedExtensions method`() {
            // Arrange
            val method = TreeSitterMetrics::class.java.getMethod("getSupportedExtensions")

            // Assert
            assertThat(method.returnType).isEqualTo(Set::class.java)
        }
    }

    @Nested
    inner class TreeSitterExtractionApiContract {
        @Test
        fun `should have extract method accepting File`() {
            // Arrange
            val method = TreeSitterExtraction::class.java.getMethod("extract", File::class.java)

            // Assert
            assertThat(method.returnType.name).isEqualTo(
                "de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionResult"
            )
        }

        @Test
        fun `should have extract method accepting String and Language`() {
            // Arrange
            val method = TreeSitterExtraction::class.java.getMethod(
                "extract",
                String::class.java,
                Language::class.java
            )

            // Assert
            assertThat(method.returnType.name).isEqualTo(
                "de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionResult"
            )
        }

        @Test
        fun `should have isExtractionSupported method accepting Language`() {
            // Arrange
            val method = TreeSitterExtraction::class.java.getMethod(
                "isExtractionSupported",
                Language::class.java
            )

            // Assert
            assertThat(method.returnType).isEqualTo(Boolean::class.java)
        }

        @Test
        fun `should have isExtractionSupported method accepting String`() {
            // Arrange
            val method = TreeSitterExtraction::class.java.getMethod(
                "isExtractionSupported",
                String::class.java
            )

            // Assert
            assertThat(method.returnType).isEqualTo(Boolean::class.java)
        }

        @Test
        fun `should have getSupportedLanguages method`() {
            // Arrange
            val method = TreeSitterExtraction::class.java.getMethod("getSupportedLanguages")

            // Assert
            assertThat(method.returnType).isEqualTo(List::class.java)
        }

        @Test
        fun `should have getSupportedExtensions method`() {
            // Arrange
            val method = TreeSitterExtraction::class.java.getMethod("getSupportedExtensions")

            // Assert
            assertThat(method.returnType).isEqualTo(Set::class.java)
        }
    }

    @Nested
    inner class MetricsResultApiContract {
        @Test
        fun `should have metrics property`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("complexity" to 1.0))

            // Assert
            assertThat(result.metrics).isInstanceOf(Map::class.java)
        }

        @Test
        fun `should have perFunctionMetrics property`() {
            // Arrange
            val result = MetricsResult(
                metrics = mapOf(),
                perFunctionMetrics = mapOf("max_complexity_per_function" to 1.0)
            )

            // Assert
            assertThat(result.perFunctionMetrics).isInstanceOf(Map::class.java)
        }

        @Test
        fun `should have complexity accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("complexity" to 5.0))

            // Assert
            assertThat(result.complexity).isEqualTo(5.0)
        }

        @Test
        fun `should have logicComplexity accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("logic_complexity" to 3.0))

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @Test
        fun `should have commentLines accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("comment_lines" to 10.0))

            // Assert
            assertThat(result.commentLines).isEqualTo(10.0)
        }

        @Test
        fun `should have realLinesOfCode accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("rloc" to 100.0))

            // Assert
            assertThat(result.realLinesOfCode).isEqualTo(100.0)
        }

        @Test
        fun `should have linesOfCode accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("loc" to 150.0))

            // Assert
            assertThat(result.linesOfCode).isEqualTo(150.0)
        }

        @Test
        fun `should have numberOfFunctions accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("number_of_functions" to 8.0))

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(8.0)
        }

        @Test
        fun `should have longMethod accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("long_method" to 2.0))

            // Assert
            assertThat(result.longMethod).isEqualTo(2.0)
        }

        @Test
        fun `should have longParameterList accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("long_parameter_list" to 1.0))

            // Assert
            assertThat(result.longParameterList).isEqualTo(1.0)
        }

        @Test
        fun `should have excessiveComments accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("excessive_comments" to 1.0))

            // Assert
            assertThat(result.excessiveComments).isEqualTo(1.0)
        }

        @Test
        fun `should have commentRatio accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("comment_ratio" to 0.25))

            // Assert
            assertThat(result.commentRatio).isEqualTo(0.25)
        }

        @Test
        fun `should have messageChains accessor`() {
            // Arrange
            val result = MetricsResult(metrics = mapOf("message_chains" to 3.0))

            // Assert
            assertThat(result.messageChains).isEqualTo(3.0)
        }
    }

    @Nested
    inner class ExtractionResultApiContract {
        @Test
        fun `should have extractedTexts property`() {
            // Arrange
            val result = ExtractionResult(extractedTexts = emptyList())

            // Assert
            assertThat(result.extractedTexts).isInstanceOf(List::class.java)
        }

        @Test
        fun `should have identifiers accessor`() {
            // Arrange
            val result = ExtractionResult(extractedTexts = emptyList())

            // Assert
            assertThat(result.identifiers).isInstanceOf(List::class.java)
        }

        @Test
        fun `should have comments accessor`() {
            // Arrange
            val result = ExtractionResult(extractedTexts = emptyList())

            // Assert
            assertThat(result.comments).isInstanceOf(List::class.java)
        }

        @Test
        fun `should have strings accessor`() {
            // Arrange
            val result = ExtractionResult(extractedTexts = emptyList())

            // Assert
            assertThat(result.strings).isInstanceOf(List::class.java)
        }
    }

    @Nested
    inner class LanguageEnumContract {
        @Test
        fun `should have exactly 19 language values`() {
            // Assert
            assertThat(Language.entries).hasSize(19)
        }

        @Test
        fun `should contain JAVA`() {
            // Assert
            assertThat(Language.valueOf("JAVA")).isEqualTo(Language.JAVA)
        }

        @Test
        fun `should contain KOTLIN`() {
            // Assert
            assertThat(Language.valueOf("KOTLIN")).isEqualTo(Language.KOTLIN)
        }

        @Test
        fun `should contain TYPESCRIPT`() {
            // Assert
            assertThat(Language.valueOf("TYPESCRIPT")).isEqualTo(Language.TYPESCRIPT)
        }

        @Test
        fun `should contain JAVASCRIPT`() {
            // Assert
            assertThat(Language.valueOf("JAVASCRIPT")).isEqualTo(Language.JAVASCRIPT)
        }

        @Test
        fun `should contain PYTHON`() {
            // Assert
            assertThat(Language.valueOf("PYTHON")).isEqualTo(Language.PYTHON)
        }

        @Test
        fun `should contain GO`() {
            // Assert
            assertThat(Language.valueOf("GO")).isEqualTo(Language.GO)
        }

        @Test
        fun `should contain PHP`() {
            // Assert
            assertThat(Language.valueOf("PHP")).isEqualTo(Language.PHP)
        }

        @Test
        fun `should contain RUBY`() {
            // Assert
            assertThat(Language.valueOf("RUBY")).isEqualTo(Language.RUBY)
        }

        @Test
        fun `should contain SWIFT`() {
            // Assert
            assertThat(Language.valueOf("SWIFT")).isEqualTo(Language.SWIFT)
        }

        @Test
        fun `should contain BASH`() {
            // Assert
            assertThat(Language.valueOf("BASH")).isEqualTo(Language.BASH)
        }

        @Test
        fun `should contain CSHARP`() {
            // Assert
            assertThat(Language.valueOf("CSHARP")).isEqualTo(Language.CSHARP)
        }

        @Test
        fun `should contain CPP`() {
            // Assert
            assertThat(Language.valueOf("CPP")).isEqualTo(Language.CPP)
        }

        @Test
        fun `should contain C`() {
            // Assert
            assertThat(Language.valueOf("C")).isEqualTo(Language.C)
        }

        @Test
        fun `should contain OBJECTIVE_C`() {
            // Assert
            assertThat(Language.valueOf("OBJECTIVE_C")).isEqualTo(Language.OBJECTIVE_C)
        }

        @Test
        fun `should contain DELPHI`() {
            // Assert
            assertThat(Language.valueOf("DELPHI")).isEqualTo(Language.DELPHI)
        }

        @Test
        fun `should contain RUST`() {
            // Assert
            assertThat(Language.valueOf("RUST")).isEqualTo(Language.RUST)
        }

        @Test
        fun `should have fromExtension companion method`() {
            // Act - call the method to verify it exists with expected signature
            val result: Language? = Language.fromExtension(".java")

            // Assert
            assertThat(result).isEqualTo(Language.JAVA)
        }

        @Test
        fun `should have fromFilename companion method`() {
            // Act - call the method to verify it exists with expected signature
            val result: Language? = Language.fromFilename("Main.java")

            // Assert
            assertThat(result).isEqualTo(Language.JAVA)
        }

        @Test
        fun `should have primaryExtension property`() {
            // Assert
            assertThat(Language.JAVA.primaryExtension).isEqualTo(".java")
        }

        @Test
        fun `should have otherExtensions property`() {
            // Assert
            assertThat(Language.KOTLIN.otherExtensions).isInstanceOf(Set::class.java)
        }
    }

    @Nested
    inner class ExtractionContextEnumContract {
        @Test
        fun `should have exactly 3 context values`() {
            // Assert
            assertThat(ExtractionContext.entries).hasSize(3)
        }

        @Test
        fun `should contain IDENTIFIER`() {
            // Assert
            assertThat(ExtractionContext.valueOf("IDENTIFIER")).isEqualTo(ExtractionContext.IDENTIFIER)
        }

        @Test
        fun `should contain COMMENT`() {
            // Assert
            assertThat(ExtractionContext.valueOf("COMMENT")).isEqualTo(ExtractionContext.COMMENT)
        }

        @Test
        fun `should contain STRING`() {
            // Assert
            assertThat(ExtractionContext.valueOf("STRING")).isEqualTo(ExtractionContext.STRING)
        }
    }
}
