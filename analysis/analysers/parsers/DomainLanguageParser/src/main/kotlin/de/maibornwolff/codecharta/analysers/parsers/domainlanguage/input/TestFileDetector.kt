package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

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
        val normalizedPath = file.absolutePath.replace('\\', '/')
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
        (name.endsWith(".kt", ignoreCase = true) || name.endsWith(".kts", ignoreCase = true)) &&
            nameWithoutExtension.endsWith("Test")

    private fun matchesTypeScriptJavaScriptTestPattern(name: String): Boolean {
        val jsExtensions = listOf(".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".cts", ".mts")
        val hasJsExtension = jsExtensions.any { ext -> name.endsWith(ext, ignoreCase = true) }

        return hasJsExtension && (name.contains(".test.") || name.contains(".spec."))
    }

    private fun matchesJavaTestPattern(name: String, nameWithoutExtension: String): Boolean =
        name.endsWith(".java", ignoreCase = true) && nameWithoutExtension.endsWith("Test")

    private fun matchesPythonTestPattern(name: String, nameWithoutExtension: String): Boolean = name.endsWith(".py", ignoreCase = true) &&
        (nameWithoutExtension.startsWith("test_") || nameWithoutExtension.endsWith("_test"))
}
