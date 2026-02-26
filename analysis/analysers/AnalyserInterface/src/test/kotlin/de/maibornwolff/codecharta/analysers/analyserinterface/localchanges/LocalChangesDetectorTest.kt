package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class LocalChangesDetectorTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should throw error when not in a git repo`() {
        // Arrange
        val helper = LocalChangesDetector(tempDir.toFile())

        // Act & Assert
        assertThatThrownBy { helper.getLocallyChangedFiles() }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("--local-changes requires a git repository")
    }

    @Test
    fun `should throw error when no upstream branch is set`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val helper = LocalChangesDetector(repoDir)

        // Act & Assert
        assertThatThrownBy { helper.detectUpstreamBranch() }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("--local-changes requires an upstream tracking branch")
    }

    @Test
    fun `should detect untracked files in a git repo`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        File(repoDir, "newfile.kt").writeText("fun main() {}")

        val helper = LocalChangesDetector(repoDir)

        // Act
        val result = helper.getUntrackedFiles()

        // Assert
        assertThat(result).contains("newfile.kt")
    }

    @Test
    fun `should detect staged files in a git repo`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val testFile = File(repoDir, "staged.kt")
        testFile.writeText("fun staged() {}")
        executeGit(repoDir, "add", "staged.kt")

        val helper = LocalChangesDetector(repoDir)

        // Act
        val result = helper.getStagedAndUnstagedFiles()

        // Assert
        assertThat(result).contains("staged.kt")
    }

    @Test
    fun `should detect unstaged modifications in a git repo`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        val testFile = File(repoDir, "existing.kt")
        testFile.writeText("fun original() {}")
        executeGit(repoDir, "add", "existing.kt")
        executeGit(repoDir, "commit", "-m", "initial")
        testFile.writeText("fun modified() {}")

        val helper = LocalChangesDetector(repoDir)

        // Act
        val result = helper.getStagedAndUnstagedFiles()

        // Assert
        assertThat(result).contains("existing.kt")
    }

    @Test
    fun `should return union of all change types`() {
        // Arrange
        val queries = mockk<GitDiffQueries>()
        every { queries.isInsideWorkTree() } returns "true"
        every { queries.upstreamBranchName() } returns "origin/main"
        every { queries.changedFilesSince("origin/main") } returns setOf("committed.kt")
        every { queries.deletedFilesSince("origin/main") } returns emptySet()
        every { queries.stagedChangedFiles() } returns setOf("staged.kt")
        every { queries.unstagedChangedFiles() } returns emptySet()
        every { queries.stagedDeletedFiles() } returns emptySet()
        every { queries.unstagedDeletedFiles() } returns emptySet()
        every { queries.untrackedFiles() } returns setOf("untracked.kt")

        val detector = LocalChangesDetector(tempDir.toFile(), queries)

        // Act
        val result = detector.getLocallyChangedFiles()

        // Assert
        assertThat(result.changedFiles).containsExactlyInAnyOrder("committed.kt", "staged.kt", "untracked.kt")
        assertThat(result.deletedFiles).isEmpty()
    }

    @Test
    fun `should report deleted files separately from changed files`() {
        // Arrange
        val queries = mockk<GitDiffQueries>()
        every { queries.isInsideWorkTree() } returns "true"
        every { queries.upstreamBranchName() } returns "origin/main"
        every { queries.changedFilesSince("origin/main") } returns setOf("changed.kt")
        every { queries.deletedFilesSince("origin/main") } returns setOf("deleted.kt")
        every { queries.stagedChangedFiles() } returns emptySet()
        every { queries.unstagedChangedFiles() } returns emptySet()
        every { queries.stagedDeletedFiles() } returns emptySet()
        every { queries.unstagedDeletedFiles() } returns emptySet()
        every { queries.untrackedFiles() } returns emptySet()

        val detector = LocalChangesDetector(tempDir.toFile(), queries)

        // Act
        val result = detector.getLocallyChangedFiles()

        // Assert
        assertThat(result.changedFiles).containsExactly("changed.kt")
        assertThat(result.deletedFiles).containsExactly("deleted.kt")
    }

    @Test
    fun `should not include deleted files in changed files set`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)

        val testFile = File(repoDir, "todelete.kt")
        testFile.writeText("fun delete() {}")
        executeGit(repoDir, "add", "todelete.kt")
        executeGit(repoDir, "commit", "-m", "add file")
        testFile.delete()

        val helper = LocalChangesDetector(repoDir)

        // Act
        val result = helper.getStagedAndUnstagedFiles()

        // Assert
        assertThat(result).doesNotContain("todelete.kt")
    }

    @Test
    fun `should handle files in subdirectories`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)

        val subDir = File(repoDir, "src/main")
        subDir.mkdirs()
        File(subDir, "deep.kt").writeText("fun deep() {}")

        val helper = LocalChangesDetector(repoDir)

        // Act
        val result = helper.getUntrackedFiles()

        // Assert
        assertThat(result).contains("src/main/deep.kt")
    }

    @Test
    fun `should not include stderr output in git results`() {
        // Arrange
        val repoDir = tempDir.toFile()
        initGitRepo(repoDir)
        File(repoDir, "clean.kt").writeText("fun clean() {}")
        executeGit(repoDir, "add", "clean.kt")
        executeGit(repoDir, "commit", "-m", "initial")
        val helper = LocalChangesDetector(repoDir)

        // Act
        val result = helper.getUntrackedFiles()

        // Assert - no stderr contamination, just an empty set
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
