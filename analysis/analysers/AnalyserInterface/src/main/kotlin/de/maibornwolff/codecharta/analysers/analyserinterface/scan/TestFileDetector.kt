package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import java.io.File

/**
 * Recognizes test sources by directory and by the naming convention each language ecosystem uses.
 * Directories are matched on the path inside the project, so a project that merely lives under a
 * directory called `test` does not analyse as if every one of its files were a test.
 */
class TestFileDetector(private val analysisRoot: File) {
    fun isTestFile(file: File): Boolean = isInTestDirectory(file) || hasTestFileName(file.name)

    private fun isInTestDirectory(file: File): Boolean = directoriesInsideProject(file).any { it.lowercase() in TEST_DIRECTORIES }

    // Both sides are made absolute first: a relative file and an absolute root share no root for
    // `toRelativeString`, which would throw. A file outside the project has no directories inside it
    // and is judged by its name alone.
    private fun directoriesInsideProject(file: File): List<String> = runCatching {
        file.absoluteFile.toRelativeString(analysisRoot.absoluteFile).replace(File.separatorChar, '/').split("/")
    }.getOrDefault(emptyList()).dropLast(1)

    private fun hasTestFileName(fileName: String): Boolean {
        val nameWithoutExtension = fileName.substringBeforeLast('.')
        return when {
            matchesAnyExtension(fileName, TYPE_NAME_SUFFIX_EXTENSIONS) ->
                nameWithoutExtension.endsWith("Test") || nameWithoutExtension.endsWith("Tests")

            matchesAnyExtension(fileName, INFIX_MARKER_EXTENSIONS) -> fileName.contains(".test.") || fileName.contains(".spec.")

            matchesAnyExtension(fileName, PYTHON_EXTENSIONS) ->
                nameWithoutExtension.startsWith("test_") || nameWithoutExtension.endsWith("_test")

            matchesAnyExtension(fileName, GO_EXTENSIONS) -> nameWithoutExtension.endsWith("_test")

            matchesAnyExtension(fileName, RUBY_EXTENSIONS) ->
                nameWithoutExtension.endsWith("_spec") || nameWithoutExtension.endsWith("_test")

            else -> false
        }
    }

    companion object {
        private val TEST_DIRECTORIES = setOf("test", "tests", "__tests__", "spec", "specs")

        private val TYPE_NAME_SUFFIX_EXTENSIONS = setOf("kt", "kts", "java", "cs", "php")
        private val INFIX_MARKER_EXTENSIONS = setOf("ts", "tsx", "cts", "mts", "js", "jsx", "cjs", "mjs", "vue")
        private val PYTHON_EXTENSIONS = setOf("py", "pyw")
        private val GO_EXTENSIONS = setOf("go")
        private val RUBY_EXTENSIONS = setOf("rb")
    }
}
