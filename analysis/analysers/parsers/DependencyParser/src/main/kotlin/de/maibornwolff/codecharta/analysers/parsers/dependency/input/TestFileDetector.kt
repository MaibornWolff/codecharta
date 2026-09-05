package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import java.io.File

/**
 * Recognizes test sources by directory and by the naming conventions each language uses.
 *
 * Tests pull levels and cycles around noticeably — a test depends on everything it exercises, and
 * nothing depends on it — so they are excluded by default and opted back in with `--include-tests`.
 */
class TestFileDetector(private val analysisRoot: File) {
    fun isTestFile(file: File): Boolean = isInTestDirectory(file) || hasTestFileName(file.name)

    // Matched against the path inside the project, not the absolute one, so a project that merely lives
    // under a directory called `test` does not analyse as if every one of its files were a test.
    private fun isInTestDirectory(file: File): Boolean = directoriesInsideProject(file).any { it.lowercase() in TEST_DIRECTORIES }

    // Both sides are made absolute first: a relative input file and an absolute root share no root for
    // `toRelativeString`, which would throw. A file genuinely outside the project has no directories
    // inside it and is judged by its name alone.
    private fun directoriesInsideProject(file: File): List<String> = runCatching {
        file.absoluteFile.toRelativeString(analysisRoot.absoluteFile).replace(File.separatorChar, '/').split("/")
    }.getOrDefault(emptyList()).dropLast(1)

    private fun hasTestFileName(name: String): Boolean {
        val language = SupportedLanguage.ofFileName(name) ?: return false
        val nameWithoutExtension = name.substringBeforeLast('.')
        return when (language) {
            SupportedLanguage.KOTLIN, SupportedLanguage.JAVA, SupportedLanguage.C_SHARP, SupportedLanguage.PHP ->
                nameWithoutExtension.endsWith("Test") || nameWithoutExtension.endsWith("Tests")

            SupportedLanguage.TYPESCRIPT, SupportedLanguage.JAVASCRIPT, SupportedLanguage.VUE ->
                name.contains(".test.") || name.contains(".spec.")

            SupportedLanguage.PYTHON ->
                nameWithoutExtension.startsWith("test_") || nameWithoutExtension.endsWith("_test")

            SupportedLanguage.GO -> nameWithoutExtension.endsWith("_test")

            SupportedLanguage.CPP, SupportedLanguage.DELPHI, SupportedLanguage.RUST -> false
        }
    }

    companion object {
        private val TEST_DIRECTORIES = setOf("test", "tests", "__tests__")
    }
}
