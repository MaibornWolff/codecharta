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
            // Kotlin: UserTest.kt, ServiceTest.kts
            matchesKotlinTestPattern(name, nameWithoutExtension) -> true

            // TypeScript/JavaScript: user.test.ts, service.spec.js
            matchesTypeScriptJavaScriptTestPattern(name) -> true

            // Java: UserTest.java
            matchesJavaTestPattern(name, nameWithoutExtension) -> true

            // Python: test_user.py, user_test.py
            matchesPythonTestPattern(name, nameWithoutExtension) -> true

            else -> false
        }
    }

    private fun matchesKotlinTestPattern(name: String, nameWithoutExtension: String): Boolean =
        hasExtensionOf(name, Language.KOTLIN) && nameWithoutExtension.endsWith("Test")

    private fun matchesTypeScriptJavaScriptTestPattern(name: String): Boolean {
        val hasJsExtension = hasExtensionOf(name, Language.TYPESCRIPT) || hasExtensionOf(name, Language.JAVASCRIPT)
        return hasJsExtension && (name.contains(".test.") || name.contains(".spec."))
    }

    private fun matchesJavaTestPattern(name: String, nameWithoutExtension: String): Boolean =
        hasExtensionOf(name, Language.JAVA) && nameWithoutExtension.endsWith("Test")

    private fun matchesPythonTestPattern(name: String, nameWithoutExtension: String): Boolean = hasExtensionOf(name, Language.PYTHON) &&
        (nameWithoutExtension.startsWith("test_") || nameWithoutExtension.endsWith("_test"))

    /** Derived from [Language] so a newly supported extension is covered here too, rather than silently skipped. */
    private fun hasExtensionOf(name: String, language: Language): Boolean =
        language.extensions.any { extension -> name.endsWith(".$extension", ignoreCase = true) }
}
