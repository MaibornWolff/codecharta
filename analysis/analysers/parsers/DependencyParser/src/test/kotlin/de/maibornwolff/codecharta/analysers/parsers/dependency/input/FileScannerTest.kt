package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class FileScannerTest {
    private val fixtures = File("src/test/resources/filescanner")

    private fun scan(
        directory: String = "",
        extensions: List<String> = SupportedLanguage.allSuffixes(),
        maxFileSizeKb: Int = FileScanner.NO_FILE_SIZE_LIMIT,
        excludeTests: Boolean = true,
        excludePatterns: List<String> = emptyList()
    ): List<String> = FileScanner(extensions, maxFileSizeKb, excludeTests, excludePatterns)
        .scan(File(fixtures, directory).path, bypassGitignore = true)
        .map { it.name }

    @Test
    fun `should exclude files whose path inside the project matches an exclude pattern`() {
        // Act
        val found = scan(directory = "custom-exclusions", excludePatterns = listOf("/generated/", "Vendor"))

        // Assert
        assertThat(found).containsExactly("App.java")
    }

    @Test
    fun `should not enter a directory that matches an exclude pattern`() {
        // Act
        val found = scan(directory = "ignoreddirectories", excludePatterns = listOf("/node_modules/"), excludeTests = false)

        // Assert
        assertThat(found).containsExactly("Test.ts")
    }

    @Test
    fun `should match exclude patterns against the path inside the project, not the absolute one`() {
        // Arrange: the fixture root itself lives under `src/test/resources`, which this pattern would match.

        // Act
        val found = scan(directory = "custom-exclusions", excludePatterns = listOf("/resources/"))

        // Assert
        assertThat(found).containsExactlyInAnyOrder("App.java", "Gen.java", "Vendor.java")
    }

    @Test
    fun `should return files in path order so results do not depend on the directory listing`() {
        // Act
        val found = FileScanner(SupportedLanguage.allSuffixes()).scan(fixtures.path, bypassGitignore = true).map { it.path }

        // Assert
        assertThat(found).hasSizeGreaterThan(1).isSorted()
    }

    @Test
    fun `should find only files of a supported language`() {
        // Act
        val found = scan()

        // Assert: Test.html sits next to Sample.java and has no analyzer.
        assertThat(found).contains("Sample.java")
        assertThat(found).doesNotContain("Test.html")
    }

    @Test
    fun `should skip files whose extension is not in the allowed list`() {
        // Act
        val found = scan(extensions = SupportedLanguage.GO.suffixes, excludeTests = false)

        // Assert
        assertThat(found).containsExactlyInAnyOrder("main.go", "main_test.go")
    }

    @Test
    fun `should exclude test files by their naming convention in every language that has one`() {
        // Act
        val found = scan()

        // Assert
        assertThat(found).contains("Main.java", "Main.kt", "main.go", "app.ts")
        assertThat(found).doesNotContain("MainTest.java", "MainTest.kt", "main_test.go", "Test.spec.ts")
    }

    @Test
    fun `should include test files when tests are not excluded`() {
        // Act
        val found = scan(excludeTests = false)

        // Assert
        assertThat(found).contains("MainTest.java", "MainTest.kt", "main_test.go", "Test.spec.ts")
    }

    @Test
    fun `should exclude files inside a test directory`() {
        // Act
        val found = scan()

        // Assert: test-directory/test, tests-directory/tests and jest-tests/__tests__ all hold a file.
        assertThat(found).doesNotContain("SomeFile.java", "SomeFile.ts")
    }

    @Test
    fun `should judge test directories by the path inside the project, not the absolute one`() {
        // Arrange: the fixture root itself sits under `src/test/resources`, so an absolute-path check
        // would classify every file below it as a test.

        // Act
        val found = scan(directory = "java-test-files")

        // Assert
        assertThat(found).containsExactly("Main.java")
    }

    @Test
    fun `should exclude minified bundles, which declare nothing and parse into one huge expression`() {
        // Act
        val found = scan(directory = "minified-files", excludeTests = false)

        // Assert: styles.min.css is not a supported language to begin with.
        assertThat(found).containsExactlyInAnyOrder("app.js", "app.ts")
    }

    @Test
    fun `should skip files at or above the size limit`() {
        // Act
        val found = scan(directory = "file-size-filtering", maxFileSizeKb = 1)

        // Assert
        assertThat(found).containsExactly("small-file.java")
    }

    @Test
    fun `should keep every file when no size limit is set`() {
        // Act
        val found = scan(directory = "file-size-filtering")

        // Assert
        assertThat(found).containsExactlyInAnyOrder("small-file.java", "large-file.java")
    }

    @Test
    fun `should analyse a single file that is passed directly`() {
        // Act
        val found = scan(directory = "Sample.java")

        // Assert
        assertThat(found).containsExactly("Sample.java")
    }

    @Test
    fun `should return nothing for an input that does not exist`() {
        // Act
        val found = FileScanner(SupportedLanguage.allSuffixes()).scan(File(fixtures, "does-not-exist").path)

        // Assert
        assertThat(found).isEmpty()
    }

    @Test
    fun `should strip the byte order mark from file content`() {
        // Arrange: TreeSitter reads a BOM as source text and mis-tokenizes the identifiers around it.
        val bomFile = File(fixtures, "TestWithUTF-8-BomEncoding.cs")

        // Act
        val content = FileScanner(SupportedLanguage.allSuffixes()).readFileContent(bomFile)

        // Assert
        assertThat(content.getOrThrow()).doesNotContain(BYTE_ORDER_MARK)
    }

    @Test
    fun `should fail readably when asked to read a file that does not exist`() {
        // Act
        val content = FileScanner(SupportedLanguage.allSuffixes()).readFileContent(File(fixtures, "does-not-exist.java"))

        // Assert
        assertThat(content.isFailure).isTrue()
    }

    companion object {
        private const val BYTE_ORDER_MARK = "\uFEFF"
    }
}
