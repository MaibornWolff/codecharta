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

    fun resolveCommitHash(commitRef: String): String = try {
        git.run("rev-parse", commitRef).trim()
    } catch (revParseException: RuntimeException) {
        val hash = git.run("log", "--before=$commitRef", "-1", "--format=%H").trim()
        if (hash.isEmpty()) {
            throw IllegalArgumentException("No commit found for '$commitRef'", revParseException)
        }
        hash
    }

    fun shortCommitHash(commitRef: String): String {
        val fullHash = resolveCommitHash(commitRef)
        return git.run("rev-parse", "--short", fullHash).trim()
    }

    fun createWorktree(commitRef: String): File {
        require(worktreePath == null) {
            "Worktree already created. Call cleanup() before creating another worktree."
        }
        val fullHash = resolveCommitHash(commitRef)
        val tempDir = Files.createTempDirectory(WORKTREE_PREFIX).toFile()

        try {
            git.run("worktree", "add", tempDir.absolutePath, fullHash, "--detach")
        } catch (e: Exception) {
            if (!tempDir.delete()) {
                tempDir.deleteOnExit()
            }
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
