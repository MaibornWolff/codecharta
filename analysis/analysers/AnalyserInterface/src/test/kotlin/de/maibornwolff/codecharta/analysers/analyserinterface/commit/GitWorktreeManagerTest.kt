package de.maibornwolff.codecharta.analysers.analyserinterface.commit

import de.maibornwolff.codecharta.analysers.analyserinterface.localchanges.GitCommandRunner
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class GitWorktreeManagerTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should resolve full commit hash`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)

        // Act
        val hash = manager.resolveCommitHash("HEAD")

        // Assert
        assertThat(hash).matches("[0-9a-f]{40}")
    }

    @Test
    fun `should resolve short commit hash`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)

        // Act
        val shortHash = manager.shortCommitHash("HEAD")

        // Assert
        assertThat(shortHash).matches("[0-9a-f]{7,}")
    }

    @Test
    fun `should throw when no commits exist before given date`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)

        // Act & Assert — date far in the past, no commits exist
        assertThatThrownBy { manager.resolveCommitHash("1900-01-01") }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("No commit found")
    }

    @Test
    fun `should create worktree and return path to it`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)

        // Act
        val worktreePath = manager.createWorktree("HEAD")

        // Assert
        try {
            assertThat(worktreePath).exists()
            assertThat(worktreePath).isDirectory()
            assertThat(File(worktreePath, "test.txt")).exists()
        } finally {
            manager.cleanup()
        }
    }

    @Test
    fun `should cleanup worktree on cleanup call`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)
        val worktreePath = manager.createWorktree("HEAD")

        // Act
        manager.cleanup()

        // Assert
        assertThat(worktreePath).doesNotExist()
    }

    @Test
    fun `should handle double cleanup gracefully`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)
        manager.createWorktree("HEAD")
        manager.cleanup()

        // Act & Assert (should not throw)
        manager.cleanup()
    }

    @Test
    fun `should throw when creating worktree for date with no commits`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)

        // Act & Assert — date far in the past, no commits exist
        assertThatThrownBy { manager.createWorktree("1900-01-01") }
            .isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `should use injected GitCommandRunner`() {
        // Arrange
        val mockGit = mockk<GitCommandRunner>()
        val fullHash = "abc1234567890abcdef1234567890abcdef123456"
        every { mockGit.run("rev-parse", "HEAD") } returns "$fullHash\n"
        every { mockGit.run("rev-parse", "--short", fullHash) } returns "abc1234\n"
        val manager = GitWorktreeManager(tempDir.toFile(), mockGit)

        // Act
        val result = manager.shortCommitHash("HEAD")

        // Assert
        assertThat(result).isEqualTo("abc1234")
        verify { mockGit.run("rev-parse", "HEAD") }
        verify { mockGit.run("rev-parse", "--short", fullHash) }
    }

    @Test
    fun `should preserve original exception as cause when both rev-parse and date fallback fail`() {
        // Arrange
        val mockGit = mockk<GitCommandRunner>()
        every { mockGit.run("rev-parse", "not-a-ref") } throws RuntimeException("unknown revision")
        every { mockGit.run("log", "--before=not-a-ref", "-1", "--format=%H") } returns ""
        val manager = GitWorktreeManager(tempDir.toFile(), mockGit)

        // Act & Assert
        assertThatThrownBy { manager.resolveCommitHash("not-a-ref") }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("No commit found for 'not-a-ref'")
            .hasCauseInstanceOf(RuntimeException::class.java)
            .cause()
            .hasMessageContaining("unknown revision")
    }

    @Test
    fun `should fall back to date resolution when rev-parse fails`() {
        // Arrange
        val mockGit = mockk<GitCommandRunner>()
        val expectedHash = "abc1234567890abcdef1234567890abcdef123456"
        every { mockGit.run("rev-parse", "2024-01-01") } throws RuntimeException("unknown revision")
        every { mockGit.run("log", "--before=2024-01-01", "-1", "--format=%H") } returns "$expectedHash\n"
        val manager = GitWorktreeManager(tempDir.toFile(), mockGit)

        // Act
        val result = manager.resolveCommitHash("2024-01-01")

        // Assert
        assertThat(result).isEqualTo(expectedHash)
    }

    @Test
    fun `should resolve date expression via git log fallback`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepoWithCommit(repoDir)
        val manager = GitWorktreeManager(repoDir)

        // Act — commit was just created, so "in 1 hour" (future) will find it
        val hash = manager.resolveCommitHash("2099-01-01")

        // Assert
        assertThat(hash).matches("[0-9a-f]{40}")
    }

    private fun initGitRepoWithCommit(dir: File) {
        executeGit(dir, "init")
        executeGit(dir, "config", "user.email", "test@test.com")
        executeGit(dir, "config", "user.name", "Test")
        File(dir, "test.txt").writeText("hello")
        executeGit(dir, "add", "test.txt")
        executeGit(dir, "commit", "-m", "initial commit")
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
}
