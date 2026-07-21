package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.PathUtils
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import java.io.File

class TestFileDetector {
    private val testDirectories =
        setOf(
            "test",
            "tests",
            "__tests__",
            "spec",
            "specs"
        )

    fun isTestFile(file: File): Boolean = isInTestDirectory(file) || hasTestFileName(file)

    private fun isInTestDirectory(file: File): Boolean {
        val normalizedPath = PathUtils.normalizePath(file.absolutePath)
        return testDirectories.any { testDir ->
            normalizedPath.contains("/$testDir/")
        }
    }

    private fun hasTestFileName(file: File): Boolean {
        val name = file.name
        val nameWithoutExtension = name.substringBeforeLast('.')

        return when {
            // Kotlin: UserTest.kt, ServiceTest.kts — and Java: UserTest.java (same TypeName+Test convention)
            matchesTypeNameTestPattern(name, nameWithoutExtension, Language.KOTLIN) -> true
            matchesTypeNameTestPattern(name, nameWithoutExtension, Language.JAVA) -> true

            // TypeScript/JavaScript: user.test.ts, service.spec.js
            matchesTypeScriptJavaScriptTestPattern(name) -> true

            // Python: test_user.py, user_test.py
            matchesPythonTestPattern(name, nameWithoutExtension) -> true

            else -> false
        }
    }

    private fun matchesTypeNameTestPattern(name: String, nameWithoutExtension: String, language: Language): Boolean =
        hasExtensionOf(name, language) && nameWithoutExtension.endsWith("Test")

    private fun matchesTypeScriptJavaScriptTestPattern(name: String): Boolean {
        val hasJsExtension = hasExtensionOf(name, Language.TYPESCRIPT) || hasExtensionOf(name, Language.JAVASCRIPT)
        return hasJsExtension && (name.contains(".test.") || name.contains(".spec."))
    }

    private fun matchesPythonTestPattern(name: String, nameWithoutExtension: String): Boolean = hasExtensionOf(name, Language.PYTHON) &&
        (nameWithoutExtension.startsWith("test_") || nameWithoutExtension.endsWith("_test"))

    /** Derived from [Language] so a newly supported extension is covered here too, rather than silently skipped. */
    private fun hasExtensionOf(name: String, language: Language): Boolean = matchesAnyExtension(name, language.extensions)
}
