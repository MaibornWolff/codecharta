package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class GitCommandRunnerTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should run a git command and return output`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val runner = GitCommandRunner(repoDir)

        // Act
        val result = runner.run("rev-parse", "--is-inside-work-tree")

        // Assert
        assertThat(result.trim()).isEqualTo("true")
    }

    @Test
    fun `should throw when git command fails`() {
        // Arrange
        val runner = GitCommandRunner(tempDir.toFile())

        // Act & Assert
        assertThatThrownBy { runner.run("rev-parse", "--verify", "nonexistent-ref") }
            .isInstanceOf(RuntimeException::class.java)
            .hasMessageContaining("Git command failed with exit code")
    }

    @Test
    fun `should parse file list from git output`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        File(repoDir, "file1.kt").writeText("content1")
        File(repoDir, "file2.kt").writeText("content2")
        val runner = GitCommandRunner(repoDir)

        // Act
        val result = runner.runAndParseFileList("ls-files", "--others", "--exclude-standard")

        // Assert
        assertThat(result).containsExactlyInAnyOrder("file1.kt", "file2.kt")
    }

    @Test
    fun `should return empty set when no files match`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val runner = GitCommandRunner(repoDir)

        // Act
        val result = runner.runAndParseFileList("ls-files", "--others", "--exclude-standard")

        // Assert
        assertThat(result).isEmpty()
    }

    @Test
    fun `should not include stderr in output`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val runner = GitCommandRunner(repoDir)

        // Act
        val result = runner.run("status", "--porcelain")

        // Assert
        assertThat(result).isEmpty()
    }

    private fun initGitRepo(dir: File) {
        executeGit(dir, "init")
        executeGit(dir, "config", "user.email", "test@test.com")
        executeGit(dir, "config", "user.name", "Test")
    }

    private fun executeGit(dir: File, vararg args: String) {
        val process = ProcessBuilder(listOf("git") + args.toList())
            .directory(dir)
            .redirectErrorStream(true)
            .start()
        process.waitFor()
    }
}
