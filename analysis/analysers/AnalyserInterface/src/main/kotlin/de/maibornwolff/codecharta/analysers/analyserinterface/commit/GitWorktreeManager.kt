package de.maibornwolff.codecharta.analysers.analyserinterface.commit

import de.maibornwolff.codecharta.analysers.analyserinterface.localchanges.GitCommandRunner
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.file.Files

class GitWorktreeManager(private val repoRoot: File, private val git: GitCommandRunner = GitCommandRunner(repoRoot)) {
    private var worktreePath: File? = null

    companion object {
        private const val WORKTREE_PREFIX = "codecharta-worktree-"
    }

    fun resolveCommitHash(commitRef: String): String = tryRevParse(commitRef) ?: resolveByDate(commitRef)

    fun shortCommitHash(commitRef: String): String {
        val fullHash = resolveCommitHash(commitRef)
        return git.run("rev-parse", "--short", fullHash).trim()
    }

    private fun tryRevParse(commitRef: String): String? = try {
        git.run("rev-parse", commitRef).trim()
    } catch (e: RuntimeException) {
        null
    }

    private fun resolveByDate(dateRef: String): String {
        val hash = git.run("log", "--before=$dateRef", "-1", "--format=%H").trim()
        if (hash.isEmpty()) {
            throw IllegalArgumentException("No commit found for '$dateRef'")
        }
        return hash
    }

    fun createWorktree(commitRef: String): File {
        val fullHash = resolveCommitHash(commitRef)
        val tempDir = Files.createTempDirectory(WORKTREE_PREFIX).toFile()

        try {
            git.run("worktree", "add", tempDir.absolutePath, fullHash, "--detach")
        } catch (e: Exception) {
            tempDir.delete()
            throw RuntimeException("Failed to create git worktree for commit $commitRef: ${e.message}", e)
        }

        worktreePath = tempDir
        Runtime.getRuntime().addShutdownHook(Thread { cleanup() })

        Logger.info { "Created temporary worktree at ${tempDir.absolutePath} for commit ${fullHash.take(7)}" }
        return tempDir
    }

    fun cleanup() {
        val path = worktreePath ?: return
        worktreePath = null

        if (!path.name.startsWith(WORKTREE_PREFIX)) {
            Logger.warn { "Refusing to clean up path that doesn't match worktree prefix: ${path.absolutePath}" }
            return
        }

        try {
            git.run("worktree", "remove", path.absolutePath)
        } catch (e: Exception) {
            Logger.warn { "Failed to remove git worktree at ${path.absolutePath}: ${e.message}. Manual cleanup may be needed." }
        }
    }
}
