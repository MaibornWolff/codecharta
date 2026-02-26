package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

import de.maibornwolff.codecharta.util.Logger
import java.io.File

class LocalChangesDetector(
    repoRoot: File,
    private val queries: GitDiffQueries = GitDiffQueries(GitCommandRunner(repoRoot))
) {
    private val repoPath = repoRoot.absolutePath

    fun getLocallyChangedFiles(): LocalChangesResult {
        verifyGitAvailable()

        val upstream = detectUpstreamBranch()
        val changedFiles = mutableSetOf<String>()
        val deletedFiles = mutableSetOf<String>()

        changedFiles.addAll(getCommittedNotPushedFiles(upstream))
        deletedFiles.addAll(getDeletedFiles(upstream))

        changedFiles.addAll(getStagedAndUnstagedFiles())
        deletedFiles.addAll(getStagedAndUnstagedDeletedFiles())
        changedFiles.addAll(getUntrackedFiles())

        deletedFiles.removeAll(changedFiles)

        Logger.info { "Local changes: ${changedFiles.size} changed, ${deletedFiles.size} deleted" }
        return LocalChangesResult(changedFiles, deletedFiles)
    }

    private fun verifyGitAvailable() {
        try {
            val gitCheck = queries.isInsideWorkTree()
            require(gitCheck.trim() == "true") {
                "--local-changes requires a git repository, but '$repoPath' is not inside a git work tree"
            }
        } catch (_: RuntimeException) {
            throw IllegalArgumentException(
                "--local-changes requires a git repository, but '$repoPath' is not inside a git work tree"
            )
        }
    }

    internal fun detectUpstreamBranch(): String {
        try {
            return queries.upstreamBranchName().trim()
        } catch (_: RuntimeException) {
            throw IllegalArgumentException(
                "--local-changes requires an upstream tracking branch. " +
                    "Set one with: git branch --set-upstream-to=<remote>/<branch>"
            )
        }
    }

    internal fun getCommittedNotPushedFiles(upstream: String): Set<String> {
        return queries.changedFilesSince(upstream)
    }

    internal fun getStagedAndUnstagedFiles(): Set<String> {
        return queries.stagedChangedFiles() + queries.unstagedChangedFiles()
    }

    internal fun getDeletedFiles(upstream: String): Set<String> {
        return queries.deletedFilesSince(upstream)
    }

    internal fun getStagedAndUnstagedDeletedFiles(): Set<String> {
        return queries.stagedDeletedFiles() + queries.unstagedDeletedFiles()
    }

    internal fun getUntrackedFiles(): Set<String> {
        return queries.untrackedFiles()
    }
}
