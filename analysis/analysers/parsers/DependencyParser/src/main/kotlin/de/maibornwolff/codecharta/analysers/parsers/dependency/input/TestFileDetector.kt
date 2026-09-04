package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import java.io.File

/**
 * Recognizes test sources by directory and by the naming conventions each language uses.
 *
 * Tests pull levels and cycles around noticeably — a test depends on everything it exercises, and
 * nothing depends on it — so they are excluded by default and opted back in with `--include-tests`.
 */
class TestFileDetector {
    fun isTestFile(file: File): Boolean = isInTestDirectory(file) || hasTestFileName(file.name)

    private fun isInTestDirectory(file: File): Boolean {
        val normalizedPath = file.absoluteFile.invariantSeparatorsPath
        return TEST_DIRECTORIES.any { normalizedPath.contains("/$it/") }
    }

    private fun hasTestFileName(name: String): Boolean {
        val language = SupportedLanguage.ofFileName(name) ?: return false
        val nameWithoutExtension = name.substringBeforeLast('.')
        return when (language) {
            SupportedLanguage.KOTLIN, SupportedLanguage.JAVA, SupportedLanguage.C_SHARP ->
                nameWithoutExtension.endsWith("Test") || nameWithoutExtension.endsWith("Tests")

            SupportedLanguage.TYPESCRIPT, SupportedLanguage.JAVASCRIPT, SupportedLanguage.VUE ->
                name.contains(".test.") || name.contains(".spec.")

            SupportedLanguage.PYTHON ->
                nameWithoutExtension.startsWith("test_") || nameWithoutExtension.endsWith("_test")

            SupportedLanguage.GO -> nameWithoutExtension.endsWith("_test")

            SupportedLanguage.PHP -> nameWithoutExtension.endsWith("Test")

            SupportedLanguage.CPP, SupportedLanguage.DELPHI, SupportedLanguage.RUST -> false
        }
    }

    companion object {
        private val TEST_DIRECTORIES = setOf("test", "tests", "__tests__", "spec", "specs")
    }
}
