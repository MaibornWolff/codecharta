package de.maibornwolff.treesitter.excavationsite.api.contract

import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.ExtractionResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.MetricsResult
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import java.io.File

/**
 * Golden file tests for output stability.
 * These tests compare actual output against stored golden files.
 * To update golden files when changes are intentional, set UPDATE_GOLDEN_FILES to true.
 */
class GoldenFileContractTest {
    companion object {
        private const val UPDATE_GOLDEN_FILES = false
        private const val RESOURCES_PATH = "src/test/resources/contract"

        private val SAMPLE_FILE_NAMES = mapOf(
            Language.JAVA to "java_sample.java",
            Language.KOTLIN to "kotlin_sample.kt",
            Language.TYPESCRIPT to "typescript_sample.ts",
            Language.PYTHON to "python_sample.py",
            Language.JAVASCRIPT to "javascript_sample.js",
            Language.GO to "go_sample.go",
            Language.PHP to "php_sample.php",
            Language.RUBY to "ruby_sample.rb",
            Language.SWIFT to "swift_sample.swift",
            Language.BASH to "bash_sample.sh",
            Language.CSHARP to "csharp_sample.cs",
            Language.CPP to "cpp_sample.cpp",
            Language.C to "c_sample.c",
            Language.OBJECTIVE_C to "objc_sample.m",
            Language.VUE to "vue_sample.vue",
            Language.ABL to "abl_sample.p",
            Language.TSX to "tsx_sample.tsx",
            Language.DELPHI to "delphi_sample.pas",
            Language.RUST to "rust_sample.rs"
        )

        private val GOLDEN_BASE_NAMES = mapOf(
            Language.JAVA to "java_sample",
            Language.KOTLIN to "kotlin_sample",
            Language.TYPESCRIPT to "typescript_sample",
            Language.PYTHON to "python_sample",
            Language.JAVASCRIPT to "javascript_sample",
            Language.GO to "go_sample",
            Language.PHP to "php_sample",
            Language.RUBY to "ruby_sample",
            Language.SWIFT to "swift_sample",
            Language.BASH to "bash_sample",
            Language.CSHARP to "csharp_sample",
            Language.CPP to "cpp_sample",
            Language.C to "c_sample",
            Language.OBJECTIVE_C to "objc_sample",
            Language.VUE to "vue_sample",
            Language.ABL to "abl_sample",
            Language.TSX to "tsx_sample",
            Language.DELPHI to "delphi_sample",
            Language.RUST to "rust_sample"
        )
    }

    @Nested
    inner class MetricsGoldenFileTests {
        @ParameterizedTest(name = "should match golden file for {0} metrics")
        @EnumSource(Language::class)
        fun `should match golden file for metrics`(language: Language) {
            // Arrange
            val sampleFileName = SAMPLE_FILE_NAMES[language]
                ?: error("No sample file configured for $language")
            val goldenBaseName = GOLDEN_BASE_NAMES[language]
                ?: error("No golden base name configured for $language")
            val samplePath = "$RESOURCES_PATH/$sampleFileName"
            val goldenPath = "$RESOURCES_PATH/${goldenBaseName}_metrics.golden"

            // Act
            val code = File(samplePath).readText()
            val result = TreeSitterMetrics.parse(code, language)
            val actual = serializeMetrics(result)

            // Assert
            assertGoldenFile(goldenPath, actual)
        }
    }

    @Nested
    inner class ExtractionGoldenFileTests {
        @ParameterizedTest(name = "should match golden file for {0} extraction")
        @EnumSource(Language::class)
        fun `should match golden file for extraction`(language: Language) {
            // Arrange
            val sampleFileName = SAMPLE_FILE_NAMES[language]
                ?: error("No sample file configured for $language")
            val goldenBaseName = GOLDEN_BASE_NAMES[language]
                ?: error("No golden base name configured for $language")
            val samplePath = "$RESOURCES_PATH/$sampleFileName"
            val goldenPath = "$RESOURCES_PATH/${goldenBaseName}_extraction.golden"

            // Act
            val code = File(samplePath).readText()
            val result = TreeSitterExtraction.extract(code, language)
            val actual = serializeExtraction(result)

            // Assert
            assertGoldenFile(goldenPath, actual)
        }
    }

    @Nested
    inner class DependenciesGoldenFileTests {
        @Test
        fun `should match golden file for DELPHI dependencies`() {
            // Arrange
            val language = Language.DELPHI
            val sampleFileName = SAMPLE_FILE_NAMES[language]
                ?: error("No sample file configured for $language")
            val goldenBaseName = GOLDEN_BASE_NAMES[language]
                ?: error("No golden base name configured for $language")
            val samplePath = "$RESOURCES_PATH/$sampleFileName"
            val goldenPath = "$RESOURCES_PATH/${goldenBaseName}_dependencies.golden"

            // Act
            val code = File(samplePath).readText()
            val result = TreeSitterDependencies.analyze(code, language)
            val actual = serializeDependencies(result)

            // Assert
            assertGoldenFile(goldenPath, actual)
        }

        @Test
        fun `should match golden file for RUST dependencies`() {
            // Arrange
            val language = Language.RUST
            val sampleFileName = SAMPLE_FILE_NAMES[language]
                ?: error("No sample file configured for $language")
            val goldenBaseName = GOLDEN_BASE_NAMES[language]
                ?: error("No golden base name configured for $language")
            val samplePath = "$RESOURCES_PATH/$sampleFileName"
            val goldenPath = "$RESOURCES_PATH/${goldenBaseName}_dependencies.golden"

            // Act
            val code = File(samplePath).readText()
            val result = TreeSitterDependencies.analyze(code, language)
            val actual = serializeDependencies(result)

            // Assert
            assertGoldenFile(goldenPath, actual)
        }
    }

    private fun serializeMetrics(result: MetricsResult): String {
        val builder = StringBuilder()

        builder.appendLine("# File Metrics")
        result.metrics.toSortedMap().forEach { (key, value) ->
            builder.appendLine("$key=$value")
        }

        builder.appendLine()
        builder.appendLine("# Per-Function Metrics")
        result.perFunctionMetrics.toSortedMap().forEach { (key, value) ->
            builder.appendLine("$key=$value")
        }

        return builder.toString().trim()
    }

    private fun serializeExtraction(result: ExtractionResult): String {
        val builder = StringBuilder()

        builder.appendLine("# Identifiers")
        result.identifiers.sorted().forEach { builder.appendLine(it) }

        builder.appendLine()
        builder.appendLine("# Comments")
        result.comments.sorted().forEach { builder.appendLine(it) }

        builder.appendLine()
        builder.appendLine("# Strings")
        result.strings.sorted().forEach { builder.appendLine(it) }

        return builder.toString().trim()
    }

    private fun serializeDependencies(result: DependencyResult): String {
        val builder = StringBuilder()

        builder.appendLine("# Package")
        builder.appendLine(result.packagePath.joinToString("."))

        builder.appendLine()
        builder.appendLine("# Imports")
        result.imports
            .map { "${if (it.isWildcard) "*:" else ""}${it.path.joinToString(".")}" }
            .sorted()
            .forEach { builder.appendLine(it) }

        builder.appendLine()
        builder.appendLine("# Declarations")
        result.declarations
            .map { declaration ->
                val parentSuffix = if (declaration.parentPath.isEmpty()) {
                    ""
                } else {
                    " (parent: ${declaration.parentPath.joinToString(".")})"
                }
                "${declaration.type}:${declaration.name}$parentSuffix"
            }.sorted()
            .forEach { builder.appendLine(it) }

        builder.appendLine()
        builder.appendLine("# Used Types (per declaration)")
        result.declarations
            .sortedBy { it.name }
            .forEach { declaration ->
                builder.appendLine(declaration.name)
                declaration.usedTypes
                    .map { formatUsedType(it) }
                    .sorted()
                    .forEach { builder.appendLine("  $it") }
            }

        return builder.toString().trim()
    }

    private fun formatUsedType(usedType: UsedType): String {
        if (usedType.genericTypes.isEmpty()) return usedType.name
        return "${usedType.name}<${usedType.genericTypes.joinToString(",") { formatUsedType(it) }}>"
    }

    private fun assertGoldenFile(goldenPath: String, actual: String) {
        val goldenFile = File(goldenPath)

        if (UPDATE_GOLDEN_FILES) {
            goldenFile.parentFile.mkdirs()
            goldenFile.writeText(actual)
            println("Updated golden file: $goldenPath")
            return
        }

        if (!goldenFile.exists()) {
            goldenFile.parentFile.mkdirs()
            goldenFile.writeText(actual)
            throw AssertionError(
                "Golden file did not exist and has been created. " +
                    "Review the content at $goldenPath and re-run the test."
            )
        }

        val expected = goldenFile.readText().trim()
        assertThat(actual)
            .withFailMessage {
                """
                |Golden file mismatch: $goldenPath
                |
                |Expected:
                |$expected
                |
                |Actual:
                |$actual
                |
                |If this change is intentional, set UPDATE_GOLDEN_FILES=true and re-run.
                """.trimMargin()
            }.isEqualTo(expected)
    }
}
