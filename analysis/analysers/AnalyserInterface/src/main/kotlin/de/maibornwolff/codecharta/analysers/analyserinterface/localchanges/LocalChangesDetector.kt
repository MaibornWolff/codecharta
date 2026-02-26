package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.util.concurrent.TimeUnit

class LocalChangesDetector(private val repoRoot: File) {
    companion object {
        private const val GIT_TIMEOUT_MINUTES = 3L
        private const val DEFAULT_FALLBACK_BRANCH = "origin/main"
        private const val REV_PARSE = "rev-parse"
        private const val NAME_ONLY = "--name-only"
        private const val DIFF_FILTER_CHANGED = "--diff-filter=ACMR"
        private const val DIFF_FILTER_DELETED = "--diff-filter=D"
    }

    fun getLocallyChangedFiles(): LocalChangesResult {
        verifyGitAvailable()

        val upstream = detectUpstreamBranch()
        val changedFiles = mutableSetOf<String>()
        val deletedFiles = mutableSetOf<String>()

        if (upstream != null) {
            changedFiles.addAll(getCommittedNotPushedFiles(upstream))
            deletedFiles.addAll(getDeletedFiles(upstream))
        } else {
            Logger.warn { "No upstream branch detected, only analyzing staged/unstaged/untracked changes" }
        }

        changedFiles.addAll(getStagedAndUnstagedFiles())
        deletedFiles.addAll(getStagedAndUnstagedDeletedFiles())
        changedFiles.addAll(getUntrackedFiles())

        deletedFiles.removeAll(changedFiles)

        Logger.info { "Local changes: ${changedFiles.size} changed, ${deletedFiles.size} deleted" }
        return LocalChangesResult(changedFiles, deletedFiles)
    }

    private fun verifyGitAvailable() {
        try {
            val gitCheck = gitIsInsideWorkTree()
            require(gitCheck.trim() == "true") {
                "--local-changes requires a git repository, but '${repoRoot.absolutePath}' is not inside a git work tree"
            }
        } catch (_: RuntimeException) {
            throw IllegalArgumentException(
                "--local-changes requires a git repository, but '${repoRoot.absolutePath}' is not inside a git work tree"
            )
        }
    }

    internal fun detectUpstreamBranch(): String? {
        try {
            return gitUpstreamBranchName().trim()
        } catch (_: RuntimeException) {
            // No tracking branch set, try fallback
        }

        try {
            gitVerifyRef(DEFAULT_FALLBACK_BRANCH)
            Logger.info { "No tracking branch set, falling back to $DEFAULT_FALLBACK_BRANCH" }
            return DEFAULT_FALLBACK_BRANCH
        } catch (_: RuntimeException) {
            // Fallback branch doesn't exist either
        }

        return null
    }

    internal fun getCommittedNotPushedFiles(upstream: String): Set<String> {
        return parseFileList(gitDiffChangedFilesSince(upstream))
    }

    internal fun getStagedAndUnstagedFiles(): Set<String> {
        return parseFileList(gitDiffStagedChangedFiles()) + parseFileList(gitDiffUnstagedChangedFiles())
    }

    internal fun getDeletedFiles(upstream: String): Set<String> {
        return parseFileList(gitDiffDeletedFilesSince(upstream))
    }

    internal fun getStagedAndUnstagedDeletedFiles(): Set<String> {
        return parseFileList(gitDiffStagedDeletedFiles()) + parseFileList(gitDiffUnstagedDeletedFiles())
    }

    internal fun getUntrackedFiles(): Set<String> {
        return parseFileList(gitListUntrackedFiles())
    }

    // --- Git command wrappers ---

    private fun gitIsInsideWorkTree(): String {
        return runGitCommand(REV_PARSE, "--is-inside-work-tree")
    }

    private fun gitUpstreamBranchName(): String {
        return runGitCommand(REV_PARSE, "--abbrev-ref", "@{upstream}")
    }

    private fun gitVerifyRef(ref: String): String {
        return runGitCommand(REV_PARSE, "--verify", ref)
    }

    private fun gitDiffChangedFilesSince(ref: String): String {
        return runGitCommand("diff", NAME_ONLY, DIFF_FILTER_CHANGED, "$ref..HEAD")
    }

    private fun gitDiffStagedChangedFiles(): String {
        return runGitCommand("diff", NAME_ONLY, DIFF_FILTER_CHANGED, "--cached")
    }

    private fun gitDiffUnstagedChangedFiles(): String {
        return runGitCommand("diff", NAME_ONLY, DIFF_FILTER_CHANGED)
    }

    private fun gitDiffDeletedFilesSince(ref: String): String {
        return runGitCommand("diff", NAME_ONLY, DIFF_FILTER_DELETED, "$ref..HEAD")
    }

    private fun gitDiffStagedDeletedFiles(): String {
        return runGitCommand("diff", NAME_ONLY, DIFF_FILTER_DELETED, "--cached")
    }

    private fun gitDiffUnstagedDeletedFiles(): String {
        return runGitCommand("diff", NAME_ONLY, DIFF_FILTER_DELETED)
    }

    private fun gitListUntrackedFiles(): String {
        return runGitCommand("ls-files", "--others", "--exclude-standard")
    }

    // --- Infrastructure ---

    private fun parseFileList(output: String): Set<String> {
        if (output.isBlank()) return emptySet()
        return output.lines()
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .toSet()
    }

    private fun runGitCommand(vararg args: String): String {
        val command = listOf("git") + args.toList()
        val commandString = "git ${args.joinToString(" ")}"
        val process = ProcessBuilder(command)
            .directory(repoRoot)
            .redirectError(ProcessBuilder.Redirect.DISCARD)
            .start()

        val output = process.inputStream.bufferedReader().readText()
        val completed = process.waitFor(GIT_TIMEOUT_MINUTES, TimeUnit.MINUTES)

        if (!completed) {
            process.destroyForcibly()
            throw RuntimeException("Git command timed out after $GIT_TIMEOUT_MINUTES minutes: $commandString")
        }

        if (process.exitValue() != 0) {
            throw RuntimeException("Git command failed with exit code ${process.exitValue()}: $commandString")
        }

        return output
    }
}
