package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TestFileDetectorTest {
    private val detector = TestFileDetector()

    @Test
    fun `should detect Kotlin test files ending with Test`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFile1 = File(dir, "UserTest.kt")
        val testFile2 = File(dir, "ServiceTest.kts")
        testFile1.createNewFile()
        testFile2.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile1))
        assertTrue(detector.isTestFile(testFile2))
    }

    @Test
    fun `should not detect regular Kotlin files as tests`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val regularFile1 = File(dir, "User.kt")
        val regularFile2 = File(dir, "Service.kts")
        val withTestInName = File(dir, "UserTestHelper.kt")
        regularFile1.createNewFile()
        regularFile2.createNewFile()
        withTestInName.createNewFile()

        // Act & Assert
        assertFalse(detector.isTestFile(regularFile1))
        assertFalse(detector.isTestFile(regularFile2))
        assertFalse(detector.isTestFile(withTestInName))
    }

    @Test
    fun `should detect TypeScript test files with test pattern`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFiles =
            listOf(
                File(dir, "user.test.ts"),
                File(dir, "service.test.tsx"),
                File(dir, "handler.test.js"),
                File(dir, "component.test.jsx"),
                File(dir, "module.test.cjs"),
                File(dir, "util.test.mjs"),
                File(dir, "types.test.cts"),
                File(dir, "config.test.mts")
            )
        testFiles.forEach { it.createNewFile() }

        // Act & Assert
        testFiles.forEach { file ->
            assertTrue(detector.isTestFile(file), "Expected ${file.name} to be detected as test file")
        }
    }

    @Test
    fun `should detect TypeScript spec files with spec pattern`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val specFiles =
            listOf(
                File(dir, "user.spec.ts"),
                File(dir, "service.spec.tsx"),
                File(dir, "handler.spec.js"),
                File(dir, "component.spec.jsx")
            )
        specFiles.forEach { it.createNewFile() }

        // Act & Assert
        specFiles.forEach { file ->
            assertTrue(detector.isTestFile(file), "Expected ${file.name} to be detected as spec file")
        }
    }

    @Test
    fun `should not detect regular TypeScript files as tests`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val regularFiles =
            listOf(
                File(dir, "user.ts"),
                File(dir, "service.tsx"),
                File(dir, "handler.js"),
                File(dir, "component.jsx")
            )
        regularFiles.forEach { it.createNewFile() }

        // Act & Assert
        regularFiles.forEach { file ->
            assertFalse(detector.isTestFile(file), "Expected ${file.name} to NOT be detected as test file")
        }
    }

    @Test
    fun `should detect Java test files ending with Test`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFile = File(dir, "UserTest.java")
        testFile.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile))
    }

    @Test
    fun `should not detect regular Java files as tests`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val regularFile = File(dir, "User.java")
        val withTestInName = File(dir, "UserTestHelper.java")
        regularFile.createNewFile()
        withTestInName.createNewFile()

        // Act & Assert
        assertFalse(detector.isTestFile(regularFile))
        assertFalse(detector.isTestFile(withTestInName))
    }

    @Test
    fun `should detect Python test files with test prefix`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFile1 = File(dir, "test_user.py")
        val testFile2 = File(dir, "test_service.py")
        testFile1.createNewFile()
        testFile2.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile1))
        assertTrue(detector.isTestFile(testFile2))
    }

    @Test
    fun `should detect Python test files with test suffix`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFile1 = File(dir, "user_test.py")
        val testFile2 = File(dir, "service_test.py")
        testFile1.createNewFile()
        testFile2.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile1))
        assertTrue(detector.isTestFile(testFile2))
    }

    @Test
    fun `should detect Python test files using every extension the language declares`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val windowsScriptTest = File(dir, "test_user.pyw")
        windowsScriptTest.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(windowsScriptTest))
    }

    @Test
    fun `should not detect regular Python files as tests`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val regularFile = File(dir, "user.py")
        val withTestInMiddle = File(dir, "user_test_helper.py")
        regularFile.createNewFile()
        withTestInMiddle.createNewFile()

        // Act & Assert
        assertFalse(detector.isTestFile(regularFile))
        assertFalse(detector.isTestFile(withTestInMiddle))
    }

    @Test
    fun `should detect files in test directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testDir = File(dir, "test")
        testDir.mkdir()
        val fileInTestDir = File(testDir, "User.kt")
        fileInTestDir.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(fileInTestDir))
    }

    @Test
    fun `should detect files in tests directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testsDir = File(dir, "tests")
        testsDir.mkdir()
        val fileInTestsDir = File(testsDir, "Service.java")
        fileInTestsDir.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(fileInTestsDir))
    }

    @Test
    fun `should detect files in __tests__ directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testsDir = File(dir, "__tests__")
        testsDir.mkdir()
        val fileInTestsDir = File(testsDir, "component.tsx")
        fileInTestsDir.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(fileInTestsDir))
    }

    @Test
    fun `should detect files in spec directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val specDir = File(dir, "spec")
        specDir.mkdir()
        val fileInSpecDir = File(specDir, "user.ts")
        fileInSpecDir.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(fileInSpecDir))
    }

    @Test
    fun `should detect files in specs directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val specsDir = File(dir, "specs")
        specsDir.mkdir()
        val fileInSpecsDir = File(specsDir, "service.js")
        fileInSpecsDir.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(fileInSpecsDir))
    }

    @Test
    fun `should detect files in nested test directories`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val srcDir = File(dir, "src")
        srcDir.mkdir()
        val testDir = File(srcDir, "test")
        testDir.mkdir()
        val kotlinDir = File(testDir, "kotlin")
        kotlinDir.mkdir()
        val fileInNestedTestDir = File(kotlinDir, "User.kt")
        fileInNestedTestDir.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(fileInNestedTestDir))
    }

    @Test
    fun `should not detect files in non-test directories`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val srcDir = File(dir, "src")
        srcDir.mkdir()
        val mainDir = File(srcDir, "main")
        mainDir.mkdir()
        val fileInMainDir = File(mainDir, "User.kt")
        fileInMainDir.createNewFile()

        // Act & Assert
        assertFalse(detector.isTestFile(fileInMainDir))
    }

    @Test
    fun `should be case insensitive for Kotlin test files`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFile1 = File(dir, "UserTest.KT")
        val testFile2 = File(dir, "ServiceTest.KTS")
        testFile1.createNewFile()
        testFile2.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile1))
        assertTrue(detector.isTestFile(testFile2))
    }

    @Test
    fun `should be case insensitive for TypeScript test files`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testFile = File(dir, "user.test.TS")
        testFile.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile))
    }

    @Test
    fun `should detect test files with both directory and filename patterns`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testDir = File(dir, "test")
        testDir.mkdir()
        val testFile = File(testDir, "UserTest.kt")
        testFile.createNewFile()

        // Act & Assert
        assertTrue(detector.isTestFile(testFile))
    }
}
