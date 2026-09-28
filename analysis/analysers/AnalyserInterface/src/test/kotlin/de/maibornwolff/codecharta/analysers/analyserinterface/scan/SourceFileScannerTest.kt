package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class SourceFileScannerTest {
    @TempDir
    lateinit var projectDirectory: File

    private fun write(relativePath: String, content: String = "content"): File {
        val file = File(projectDirectory, relativePath)
        file.parentFile.mkdirs()
        file.writeText(content)
        return file
    }

    private fun scan(
        scanner: SourceFileScanner = SourceFileScanner(listOf("kt", "ts", "js", "py", "txt", "log")),
        input: File = projectDirectory,
        useGitignore: Boolean = false
    ): List<String> = scanner.scan(input, useGitignore).map { it.toRelativeString(projectDirectory).replace(File.separatorChar, '/') }

    @Test
    fun `should find files of the allowed extensions recursively and nothing else`() {
        // Arrange
        write("a.kt")
        write("sub/b.ts")
        write("sub/c.md")

        // Act
        val found = scan()

        // Assert
        assertThat(found).containsExactly("a.kt", "sub/b.ts")
    }

    @Test
    fun `should return files in path order regardless of how the directory lists them`() {
        // Arrange
        listOf("z.kt", "m/b.kt", "a.kt", "m/a.kt").forEach { write(it) }

        // Act
        val found = scan()

        // Assert
        assertThat(found).containsExactly("a.kt", "m/a.kt", "m/b.kt", "z.kt")
    }

    @Test
    fun `should exclude files whose path inside the project matches an exclude pattern`() {
        // Arrange
        write("src/App.kt")
        write("generated/Gen.kt")
        write("vendor/Vendor.kt")

        // Act
        val found = scan(SourceFileScanner(listOf("kt"), excludePatterns = listOf("/generated/", "Vendor")))

        // Assert
        assertThat(found).containsExactly("src/App.kt")
    }

    @Test
    fun `should not enter a directory that matches an exclude pattern`() {
        // Arrange
        write("node_modules/lib/index.js")
        write("not_node_modules/app.js")

        // Act
        val found = scan(SourceFileScanner(listOf("js"), excludePatterns = listOf("/node_modules/")))

        // Assert
        assertThat(found).containsExactly("not_node_modules/app.js")
    }

    @Test
    fun `should match exclude patterns against the path inside the project, not the absolute one`() {
        // Arrange: the temp directory's own absolute path is not the project's business.
        write("src/App.kt")
        val segmentOfAbsolutePath = "/" + projectDirectory.absoluteFile.parentFile.name + "/"

        // Act
        val found = scan(SourceFileScanner(listOf("kt"), excludePatterns = listOf(segmentOfAbsolutePath)))

        // Assert
        assertThat(found).containsExactly("src/App.kt")
    }

    @Test
    fun `should honour gitignore files at every level`() {
        // Arrange
        write(".gitignore", "*.log\n")
        write("keep.txt")
        write("ignore.log")
        write("sub/.gitignore", "*.txt\n")
        write("sub/gone.txt")
        write("sub/kept.kt")

        // Act
        val found = scan(useGitignore = true)

        // Assert
        assertThat(found).containsExactly("keep.txt", "sub/kept.kt")
    }

    @Test
    fun `should not consult gitignore files when asked to bypass them`() {
        // Arrange
        write(".gitignore", "*.log\n")
        write("keep.txt")
        write("ignore.log")

        // Act
        val found = scan(useGitignore = false)

        // Assert
        assertThat(found).containsExactly("ignore.log", "keep.txt")
    }

    @Test
    fun `should exclude test files by directory and by naming convention only when asked to`() {
        // Arrange
        write("User.kt")
        write("UserTest.kt")
        write("test/Helper.kt")
        write("app.spec.ts")
        write("test_app.py")

        // Act
        val withTests = scan(SourceFileScanner(listOf("kt", "ts", "py")))
        val withoutTests = scan(SourceFileScanner(listOf("kt", "ts", "py"), excludeTests = true))

        // Assert
        assertThat(withTests).hasSize(5)
        assertThat(withoutTests).containsExactly("User.kt")
    }

    @Test
    fun `should skip minified bundles, which declare nothing and parse into one huge expression`() {
        // Arrange
        write("app.js")
        write("vendor.min.js")
        write("app.bundle.js")

        // Act
        val found = scan()

        // Assert
        assertThat(found).containsExactly("app.js")
    }

    @Test
    fun `should skip files at or above the size limit and keep every file without one`() {
        // Arrange
        write("small.kt", "x")
        write("large.kt", "x".repeat(2048))

        // Act
        val limited = scan(SourceFileScanner(listOf("kt"), maxFileSizeKb = 2))
        val unlimited = scan(SourceFileScanner(listOf("kt")))

        // Assert
        assertThat(limited).containsExactly("small.kt")
        assertThat(unlimited).containsExactly("large.kt", "small.kt")
    }

    @Test
    fun `should analyse a single file that is passed directly and judge it against its own directory`() {
        // Arrange
        val source = write("Service.kt")
        write("Item.kt")
        val test = write("ServiceTest.kt")

        // Act
        val found = scan(input = source)
        val foundTest = scan(SourceFileScanner(listOf("kt"), excludeTests = true), input = test)

        // Assert
        assertThat(found).containsExactly("Service.kt")
        assertThat(foundTest).isEmpty()
    }

    @Test
    fun `should return nothing for an input that does not exist`() {
        // Act
        val found = scan(input = File(projectDirectory, "does-not-exist"))

        // Assert
        assertThat(found).isEmpty()
    }

    @Test
    fun `should report every found file once`() {
        // Arrange
        write("a.kt")
        write("b.kt")
        var reported = 0

        // Act
        SourceFileScanner(listOf("kt")).scan(projectDirectory) { reported++ }

        // Assert
        assertThat(reported).isEqualTo(2)
    }

    @Test
    fun `should strip byte order marks from file content`() {
        // Arrange
        val file = write("Class1.cs", "\uFEFFpublic class Class1\uFEFF { }")

        // Act
        val content = SourceFileScanner(listOf("cs")).readFileContent(file)

        // Assert
        assertThat(content.getOrThrow()).isEqualTo("public class Class1 { }")
    }

    @Test
    fun `should read a file in the charset it is given`() {
        // Arrange
        val file = File(projectDirectory, "utf16.txt")
        file.writeText("Hello UTF-16", Charsets.UTF_16)

        // Act
        val content = SourceFileScanner(listOf("txt")).readFileContent(file, Charsets.UTF_16)

        // Assert
        assertThat(content.getOrThrow()).isEqualTo("Hello UTF-16")
    }

    @Test
    fun `should fail readably when asked to read something that is not a file`() {
        // Act
        val missing = SourceFileScanner(listOf("txt")).readFileContent(File(projectDirectory, "missing.txt"))
        val directory = SourceFileScanner(listOf("txt")).readFileContent(projectDirectory)

        // Assert
        assertThat(missing.exceptionOrNull()).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(directory.exceptionOrNull()).isInstanceOf(IllegalArgumentException::class.java)
    }
}
