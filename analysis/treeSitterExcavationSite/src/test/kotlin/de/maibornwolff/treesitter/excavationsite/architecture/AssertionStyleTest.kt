package de.maibornwolff.treesitter.excavationsite.architecture

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@DisplayName("Assertion Style Rules")
class AssertionStyleTest {
    companion object {
        private val TEST_SOURCE_ROOT = File("src/test/kotlin")

        /**
         * Weak assertions that should be replaced with exact assertions.
         * Format: "weakMethod" to "preferredMethod(s)"
         */
        private val FORBIDDEN_ASSERTIONS = mapOf(
            ".contains(" to "containsExactly() or containsExactlyInAnyOrder()",
            ".containsOnly(" to "containsExactlyInAnyOrder()",
            ".containsAll(" to "containsExactly()",
            ".containsAnyOf(" to "containsExactly() with specific expected values",
            ".isGreaterThan(" to "isEqualTo() with exact expected value",
            ".isGreaterThanOrEqualTo(" to "isEqualTo() with exact expected value",
            ".isLessThan(" to "isEqualTo() with exact expected value",
            ".isLessThanOrEqualTo(" to "isEqualTo() with exact expected value",
            ".isBetween(" to "isEqualTo() with exact expected value",
            ".isStrictlyBetween(" to "isEqualTo() with exact expected value",
            ".isPositive(" to "isEqualTo() with exact expected value",
            ".isNegative(" to "isEqualTo() with exact expected value",
            ".isNotZero(" to "isEqualTo() with exact expected value",
            ".isNotEmpty(" to "isEqualTo() or containsExactly() with expected content",
            ".isNotNull(" to "isEqualTo() or more specific assertion",
            ".isNotBlank(" to "isEqualTo() with exact expected value",
            ".startsWith(" to "isEqualTo() with exact expected value",
            ".endsWith(" to "isEqualTo() with exact expected value",
            ".containsIgnoringCase(" to "isEqualTo() with exact expected value",
            ".containsPattern(" to "isEqualTo() or matches() with exact pattern",
            ".hasSizeGreaterThan(" to "hasSize() with exact expected size",
            ".hasSizeLessThan(" to "hasSize() with exact expected size",
            ".hasSizeGreaterThanOrEqualTo(" to "hasSize() with exact expected size",
            ".hasSizeLessThanOrEqualTo(" to "hasSize() with exact expected size",
            ".hasSizeBetween(" to "hasSize() with exact expected size"
        )

        /**
         * Files that are allowed to use weak assertions.
         * - AssertionStyleTest.kt: This test file itself
         * - *ContractTest.kt: Contract tests verify invariants, not exact values
         * - *ExplorationTest.kt: AST exploration/debugging utilities
         */
        private val EXCLUDED_FILE_PATTERNS = listOf(
            Regex("AssertionStyleTest\\.kt$"),
            Regex(".*ContractTest\\.kt$"),
            Regex(".*ExplorationTest\\.kt$")
        )
    }

    @Test
    fun `should not use weak assertions in test code`() {
        // Arrange
        val violations = mutableListOf<Violation>()

        // Act
        TEST_SOURCE_ROOT
            .walkTopDown()
            .filter { it.isFile && it.extension == "kt" }
            .filter { file -> EXCLUDED_FILE_PATTERNS.none { it.matches(file.name) } }
            .forEach { file ->
                val relativePath = file.relativeTo(TEST_SOURCE_ROOT).path
                file.readLines().forEachIndexed { index, line ->
                    val lineNumber = index + 1
                    // Only check lines that contain assertThat (to avoid false positives on boolean checks)
                    if (!line.contains("assertThat")) return@forEachIndexed
                    FORBIDDEN_ASSERTIONS.forEach { (pattern, suggestion) ->
                        if (line.contains(pattern)) {
                            violations.add(
                                Violation(
                                    file = relativePath,
                                    line = lineNumber,
                                    pattern = pattern.trim('.', '('),
                                    suggestion = suggestion,
                                    content = line.trim()
                                )
                            )
                        }
                    }
                }
            }

        // Assert
        assertThat(violations)
            .describedAs(formatViolationMessage(violations))
            .isEmpty()
    }

    private fun formatViolationMessage(violations: List<Violation>): String {
        if (violations.isEmpty()) return "No violations found"

        val grouped = violations.groupBy { it.file }
        val message = StringBuilder()
        message.appendLine("Found ${violations.size} weak assertion(s) that should be replaced:")
        message.appendLine()

        grouped.forEach { (file, fileViolations) ->
            message.appendLine("$file:")
            fileViolations.forEach { violation ->
                message.appendLine("  Line ${violation.line}: ${violation.pattern}")
                message.appendLine("    Replace with: ${violation.suggestion}")
                message.appendLine("    Code: ${violation.content}")
            }
            message.appendLine()
        }

        message.appendLine("Weak assertions make tests less precise and can hide bugs.")
        message.appendLine("Use exact assertions to verify specific expected values.")

        return message.toString()
    }

    private data class Violation(
        val file: String,
        val line: Int,
        val pattern: String,
        val suggestion: String,
        val content: String
    )
}
