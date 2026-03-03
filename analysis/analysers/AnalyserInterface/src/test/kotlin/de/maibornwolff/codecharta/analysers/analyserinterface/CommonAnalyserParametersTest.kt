package de.maibornwolff.codecharta.analysers.analyserinterface

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class CommonAnalyserParametersTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should return original input when commit is null`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = null, localChanges = false)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.worktreeManager).isNull()
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should throw when commit and localChanges both set`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "HEAD", localChanges = true)
        val inputFile = tempDir.toFile()

        // Act & Assert
        assertThatThrownBy { params.testResolveEffectiveInput(inputFile) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("mutually exclusive")
    }

    @Test
    fun `should treat blank commit as null`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "   ", localChanges = false)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.worktreeManager).isNull()
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should treat empty commit as null`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "", localChanges = false)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.worktreeManager).isNull()
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should not throw when blank commit combined with localChanges`() {
        // Arrange
        val params = TestableAnalyserParameters(commit = "  ", localChanges = true)
        val inputFile = tempDir.toFile()

        // Act
        val context = params.testResolveEffectiveInput(inputFile)

        // Assert
        assertThat(context.inputDir).isEqualTo(inputFile)
        assertThat(context.shortHash).isNull()
    }

    @Test
    fun `should create worktree and resolve input for valid commit`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val params = TestableAnalyserParameters(commit = "HEAD", localChanges = false)

        // Act
        val context = params.testResolveEffectiveInput(repoDir)

        // Assert
        try {
            assertThat(context.worktreeManager).isNotNull()
            assertThat(context.shortHash).matches("[0-9a-f]{7,}")
            assertThat(context.inputDir).exists()
            assertThat(context.inputDir).isDirectory()
            assertThat(File(context.inputDir, "test.txt")).exists()
        } finally {
            context.worktreeManager?.cleanup()
        }
    }

    @Test
    fun `should preserve subdirectory scope in worktree mode`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithSubdir(repoDir)
        val subDir = File(repoDir, "subdir")
        val params = TestableAnalyserParameters(commit = "HEAD", localChanges = false)

        // Act
        val context = params.testResolveEffectiveInput(subDir)

        // Assert
        try {
            assertThat(context.inputDir.name).isEqualTo("subdir")
            assertThat(context.inputDir).exists()
            assertThat(File(context.inputDir, "sub.txt")).exists()
        } finally {
            context.worktreeManager?.cleanup()
        }
    }

    @Test
    fun `should throw when input is not inside a git repository`() {
        // Arrange
        val nonGitDir = tempDir.resolve("no-git").toFile()
        nonGitDir.mkdirs()
        val params = TestableAnalyserParameters(commit = "HEAD", localChanges = false)

        // Act & Assert
        assertThatThrownBy { params.testResolveEffectiveInput(nonGitDir) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("Not a git repository")
    }

    private fun initGitRepoWithCommit(dir: File) {
        executeGit(dir, "init")
        executeGit(dir, "config", "user.email", "test@test.com")
        executeGit(dir, "config", "user.name", "Test")
        File(dir, "test.txt").writeText("hello")
        executeGit(dir, "add", "test.txt")
        executeGit(dir, "commit", "-m", "initial commit")
    }

    private fun initGitRepoWithSubdir(dir: File) {
        executeGit(dir, "init")
        executeGit(dir, "config", "user.email", "test@test.com")
        executeGit(dir, "config", "user.name", "Test")
        File(dir, "test.txt").writeText("hello")
        val subDir = File(dir, "subdir")
        subDir.mkdirs()
        File(subDir, "sub.txt").writeText("world")
        executeGit(dir, "add", ".")
        executeGit(dir, "commit", "-m", "initial commit with subdir")
    }

    private fun executeGit(dir: File, vararg args: String) {
        val command = listOf("git") + args.toList()
        val process = ProcessBuilder(command)
            .directory(dir)
            .redirectErrorStream(true)
            .start()
        val output = process.inputStream.bufferedReader().readText()
        process.waitFor()
        if (process.exitValue() != 0) {
            throw RuntimeException("Test git command failed (exit ${process.exitValue()}): ${command.joinToString(" ")}\n$output")
        }
    }

    private class TestableAnalyserParameters(commit: String?, localChanges: Boolean) : CommonAnalyserParameters() {
        init {
            this.commit = commit
            this.localChanges = localChanges
        }

        fun testResolveEffectiveInput(inputFile: File) = resolveEffectiveInput(inputFile)
    }
}
