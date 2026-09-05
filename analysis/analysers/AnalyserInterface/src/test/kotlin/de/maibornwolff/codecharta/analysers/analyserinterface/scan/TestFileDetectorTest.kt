package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import java.io.File

class TestFileDetectorTest {
    @TempDir
    lateinit var projectDirectory: File

    private fun detector() = TestFileDetector(projectDirectory)

    private fun fileAt(relativePath: String) = File(projectDirectory, relativePath)

    @ParameterizedTest
    @ValueSource(
        strings = [
            "UserTest.kt", "ServiceTest.kts", "UserTests.java", "UserTest.cs", "UserTest.php", "UserTest.KT",
            "user.test.ts", "service.test.tsx", "handler.spec.js", "component.spec.jsx",
            "module.test.cjs", "util.test.mjs", "types.test.cts", "config.test.mts", "user.test.TS",
            "test_user.py", "service_test.py", "test_user.pyw",
            "main_test.go",
            "user_spec.rb"
        ]
    )
    fun `should recognize a test file by the naming convention of its language`(fileName: String) {
        // Act
        val isTest = detector().isTestFile(fileAt(fileName))

        // Assert
        assertThat(isTest).describedAs(fileName).isTrue()
    }

    @ParameterizedTest
    @ValueSource(
        strings = [
            "User.kt", "Service.kts", "UserTestHelper.kt", "UserTestHelper.java",
            "user.ts", "service.tsx", "handler.js", "component.jsx",
            "user.py", "user_test_helper.py",
            "main.go", "user.rb", "Main.cpp", "README"
        ]
    )
    fun `should not mistake a production file for a test`(fileName: String) {
        // Act
        val isTest = detector().isTestFile(fileAt(fileName))

        // Assert
        assertThat(isTest).describedAs(fileName).isFalse()
    }

    @ParameterizedTest
    @ValueSource(strings = ["test", "tests", "__tests__", "spec", "specs", "src/test/kotlin", "SRC/Tests"])
    fun `should recognize a file inside a test directory at any depth`(directory: String) {
        // Act
        val isTest = detector().isTestFile(fileAt("$directory/User.kt"))

        // Assert
        assertThat(isTest).describedAs(directory).isTrue()
    }

    @Test
    fun `should not treat a production directory as a test directory`() {
        // Act
        val isTest = detector().isTestFile(fileAt("src/main/kotlin/User.kt"))

        // Assert
        assertThat(isTest).isFalse()
    }

    @Test
    fun `should judge test directories by the path inside the project, not the absolute one`() {
        // Arrange: the project itself lives under a directory called `test`.
        val nestedRoot = File(projectDirectory, "test/project")
        val file = File(nestedRoot, "src/User.kt")

        // Act
        val isTest = TestFileDetector(nestedRoot).isTestFile(file)

        // Assert
        assertThat(isTest).isFalse()
    }

    @Test
    fun `should judge a file outside the project by its name alone`() {
        // Act
        val isTest = detector().isTestFile(File(projectDirectory.parentFile, "elsewhere/UserTest.kt"))

        // Assert
        assertThat(isTest).isTrue()
    }
}
