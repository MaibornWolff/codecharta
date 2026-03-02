package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class GitDiffQueriesTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should report inside work tree for a git repo`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val queries = createQueries(repoDir)

        // Act
        val result = queries.isInsideWorkTree()

        // Assert
        assertThat(result.trim()).isEqualTo("true")
    }

    @Test
    fun `should throw when checking upstream on repo without remote`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        commitFile(repoDir, "init.kt", "content")
        val queries = createQueries(repoDir)

        // Act & Assert
        assertThatThrownBy { queries.upstreamBranchName() }
            .isInstanceOf(RuntimeException::class.java)
    }

    @Test
    fun `should detect staged changed files`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        commitFile(repoDir, "existing.kt", "original")
        File(repoDir, "existing.kt").writeText("modified")
        executeGit(repoDir, "add", "existing.kt")
        val queries = createQueries(repoDir)

        // Act
        val result = queries.stagedChangedFiles()

        // Assert
        assertThat(result).contains("existing.kt")
    }

    @Test
    fun `should detect unstaged changed files`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        commitFile(repoDir, "existing.kt", "original")
        File(repoDir, "existing.kt").writeText("modified")
        val queries = createQueries(repoDir)

        // Act
        val result = queries.unstagedChangedFiles()

        // Assert
        assertThat(result).contains("existing.kt")
    }

    @Test
    fun `should detect staged deleted files`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        commitFile(repoDir, "todelete.kt", "content")
        File(repoDir, "todelete.kt").delete()
        executeGit(repoDir, "add", "todelete.kt")
        val queries = createQueries(repoDir)

        // Act
        val result = queries.stagedDeletedFiles()

        // Assert
        assertThat(result).contains("todelete.kt")
    }

    @Test
    fun `should detect unstaged deleted files`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        commitFile(repoDir, "todelete.kt", "content")
        File(repoDir, "todelete.kt").delete()
        val queries = createQueries(repoDir)

        // Act
        val result = queries.unstagedDeletedFiles()

        // Assert
        assertThat(result).contains("todelete.kt")
    }

    @Test
    fun `should detect untracked files`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        File(repoDir, "newfile.kt").writeText("content")
        val queries = createQueries(repoDir)

        // Act
        val result = queries.untrackedFiles()

        // Assert
        assertThat(result).contains("newfile.kt")
    }

    @Test
    fun `should return empty set when no untracked files exist`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val queries = createQueries(repoDir)

        // Act
        val result = queries.untrackedFiles()

        // Assert
        assertThat(result).isEmpty()
    }

    private fun createQueries(repoDir: File): GitDiffQueries = GitDiffQueries(GitCommandRunner(repoDir))

    private fun commitFile(repoDir: File, filename: String, content: String) {
        File(repoDir, filename).writeText(content)
        executeGit(repoDir, "add", filename)
        executeGit(repoDir, "commit", "-m", "add $filename")
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
