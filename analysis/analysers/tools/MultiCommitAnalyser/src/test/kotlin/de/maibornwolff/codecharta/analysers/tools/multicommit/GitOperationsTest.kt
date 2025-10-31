package de.maibornwolff.codecharta.analysers.tools.multicommit

import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class GitOperationsTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var gitOps: GitOperations
    private lateinit var workingDir: File

    @BeforeEach
    fun setup() {
        workingDir = tempDir.toFile()
        gitOps = GitOperations(workingDir)
    }

    // NOTE: all tests fail if git is not installed

    @Test
    fun `should detect Git installation`() {
        // Arrange & Act & Assert
        assertDoesNotThrow { gitOps.checkGitInstalled() }
    }

    @Test
    fun `should throw exception when not a Git repository`() {
        // Arrange & Act & Assert
        val exception = assertThrows(GitException::class.java) {
            gitOps.checkIsGitRepository()
        }
        assertTrue(exception.message!!.contains("not a Git repository"))
    }

    @Test
    fun `should detect Git repository when dotgit exists`() {
        // Arrange
        initializeGitRepo()

        // Act & Assert
        assertDoesNotThrow { gitOps.checkIsGitRepository() }
    }

    @Test
    fun `should validate existing commit and return short SHA`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")
        val fullSha = getCurrentCommitSha()

        // Act
        val shortSha = gitOps.validateCommitExists(fullSha)

        // Assert
        assertEquals(7, shortSha.length)
        assertTrue(fullSha.startsWith(shortSha))
    }

    @Test
    fun `should throw exception for non-existent commit`() {
        // Arrange
        initializeGitRepo()

        // Act & Assert
        val exception = assertThrows(GitException::class.java) {
            gitOps.validateCommitExists("nonexistent123")
        }
        assertTrue(exception.message!!.contains("does not exist"))
    }

    @Test
    fun `should get current HEAD on a branch`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")

        // Act
        val head = gitOps.getCurrentHead()

        // Assert
        assertTrue(head.contains("refs/heads/") || head.length == 40)
    }

    @Test
    fun `should get current HEAD in detached state`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "first commit")
        val firstCommit = getCurrentCommitSha()
        createCommit("test2.txt", "second commit")
        executeGit("checkout", firstCommit)

        // Act
        val head = gitOps.getCurrentHead()

        // Assert
        assertEquals(40, head.length)
        assertEquals(firstCommit, head)
    }

    @Test
    fun `should stash changes when there are uncommitted files`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")
        File(workingDir, "new.txt").writeText("new content")

        // Act
        gitOps.stashChanges()

        // Assert
        assertFalse(File(workingDir, "new.txt").exists())
    }

    @Test
    fun `should not create stash when no changes exist`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")

        // Act & Assert
        assertDoesNotThrow { gitOps.stashChanges() }
        assertTrue(gitOps.isWorkingDirectoryClean())
    }

    @Test
    fun `should pop stash and restore changes`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")
        File(workingDir, "new.txt").writeText("new content")
        gitOps.stashChanges()

        // Act
        gitOps.popStash()

        // Assert
        assertTrue(File(workingDir, "new.txt").exists())
        assertEquals("new content", File(workingDir, "new.txt").readText())
    }

    @Test
    fun `should checkout commit successfully`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "first commit")
        val firstCommit = getCurrentCommitSha()
        createCommit("test2.txt", "second commit")

        // Act
        gitOps.checkoutCommit(firstCommit)

        // Assert
        assertTrue(File(workingDir, "test.txt").exists())
        assertFalse(File(workingDir, "test2.txt").exists())
    }

    @Test
    fun `should throw exception when checkout fails`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")

        // Act & Assert
        val exception = assertThrows(GitException::class.java) {
            gitOps.checkoutCommit("nonexistent123")
        }
        assertTrue(exception.message!!.contains("Failed to checkout"))
    }

    @Test
    fun `should save and restore original state on branch`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "first commit")
        val firstCommit = getCurrentCommitSha()
        createCommit("test2.txt", "second commit")
        gitOps.saveCurrentState()

        // Act
        gitOps.checkoutCommit(firstCommit)
        gitOps.restoreOriginalState()

        // Assert
        assertTrue(File(workingDir, "test.txt").exists())
        assertTrue(File(workingDir, "test2.txt").exists())
    }

    @Test
    fun `should detect clean working directory`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")

        // Act
        val isClean = gitOps.isWorkingDirectoryClean()

        // Assert
        assertTrue(isClean)
    }

    @Test
    fun `should detect dirty working directory with untracked files`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")
        File(workingDir, "new.txt").writeText("untracked")

        // Act
        val isClean = gitOps.isWorkingDirectoryClean()

        // Assert
        assertFalse(isClean)
    }

    @Test
    fun `should detect dirty working directory with modified files`() {
        // Arrange
        initializeGitRepo()
        createCommit("test.txt", "initial commit")
        File(workingDir, "test.txt").writeText("modified")

        // Act
        val isClean = gitOps.isWorkingDirectoryClean()

        // Assert
        assertFalse(isClean)
    }

    private fun initializeGitRepo() {
        executeGit("init")
        executeGit("config", "user.email", "test@example.com")
        executeGit("config", "user.name", "Test User")
    }

    private fun createCommit(fileName: String, commitMessage: String) {
        File(workingDir, fileName).writeText("content")
        executeGit("add", fileName)
        executeGit("commit", "-m", commitMessage)
    }

    private fun getCurrentCommitSha(): String {
        val process = ProcessBuilder("git", "rev-parse", "HEAD")
            .directory(workingDir)
            .start()
        process.waitFor()
        return process.inputStream.bufferedReader().readText().trim()
    }

    private fun executeGit(vararg args: String) {
        val process = ProcessBuilder("git", *args)
            .directory(workingDir)
            .redirectErrorStream(true)
            .start()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            val output = process.inputStream.bufferedReader().readText()
            throw RuntimeException("Git command failed: git ${args.joinToString(" ")}\nOutput: $output")
        }
    }
}
