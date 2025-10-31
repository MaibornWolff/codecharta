package de.maibornwolff.codecharta.analysers.tools.multicommit

import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

class GitOperations(private val workingDirectory: File) {
    private var originalGitState: String? = null
    private var stashCreated: Boolean = false

    fun checkGitInstalled() {
        try {
            executeGitCommand(listOf("--version"))
        } catch (e: Exception) {
            throw GitException("Git is not installed on the system", e)
        }
    }

    fun checkIsGitRepository() {
        val gitDir = File(workingDirectory, ".git")
        if (!gitDir.exists()) {
            throw GitException("Directory is not a Git repository: ${workingDirectory.absolutePath}")
        }
    }

    fun validateCommitExists(commit: String): String {
        val result = executeGitCommand(listOf("rev-parse", "--short=7", commit))
        if (result.exitCode != 0) {
            throw GitException("Commit '$commit' does not exist in the repository${formatErrorDetail(result.error)}")
        }
        return result.output.trim()
    }

    fun getCurrentHead(): String {
        val symbolicResult = executeGitCommand(listOf("symbolic-ref", "HEAD"))
        if (symbolicResult.exitCode == 0) {
            return symbolicResult.output.trim()
        }

        val headResult = executeGitCommand(listOf("rev-parse", "HEAD"))
        if (headResult.exitCode == 0) {
            return headResult.output.trim()
        }

        throw GitException("Failed to get current HEAD state${formatErrorDetail(headResult.error)}")
    }

    fun stashChanges() {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        val stashMessage = "CodeCharta MultiCommit temporary stash - $timestamp"

        val result = executeGitCommand(listOf("stash", "push", "-u", "-m", stashMessage))
        if (result.exitCode != 0) {
            throw GitException("Failed to stash changes${formatErrorDetail(result.error)}")
        }

        if (!result.output.contains("No local changes to save")) {
            stashCreated = true
            Logger.info { "Stashed uncommitted changes with message: $stashMessage" }
        }
    }

    fun popStash() {
        if (stashCreated) {
            val result = executeGitCommand(listOf("stash", "pop"))
            if (result.exitCode != 0) {
                Logger.error { "Failed to restore stash${formatErrorDetail(result.error)}. \nYou may need to manually run 'git stash pop'" }
            } else {
                Logger.info { "Restored stashed changes" }
                stashCreated = false
            }
        }
    }

    fun checkoutCommit(commit: String) {
        val result = executeGitCommand(listOf("checkout", commit))
        if (result.exitCode != 0) {
            throw GitException("Failed to checkout commit '$commit'${formatErrorDetail(result.error)}")
        }
    }

    fun restoreOriginalState() {
        originalGitState?.let { state ->
            val result = executeGitCommand(listOf("checkout", state))
            if (result.exitCode != 0) {
                throw GitException("Failed to restore original Git state '$state'${formatErrorDetail(result.error)}")
            }
            Logger.info { "Restored original Git state" }
        }
    }

    fun saveCurrentState() {
        originalGitState = getCurrentHead()
    }

    fun isWorkingDirectoryClean(): Boolean {
        val result = executeGitCommand(listOf("status", "--porcelain"))
        return result.output.trim().isEmpty()
    }

    private fun executeGitCommand(args: List<String>): GitCommandResult {
        val command = listOf("git") + args
        val runningProcess = ProcessBuilder(command).directory(workingDirectory).start()
        val output = runningProcess.inputStream.bufferedReader().readText()
        val error = runningProcess.errorStream.bufferedReader().readText()

        val completed = runningProcess.waitFor(3, TimeUnit.MINUTES)
        if (!completed) {
            runningProcess.destroyForcibly()
            throw GitException(
                "Git command timed out after 3 minutes: ${command.joinToString(" ")}"
            ) // TODO: should we allow user to set this timeout?
        }

        return GitCommandResult(
            exitCode = runningProcess.exitValue(),
            output = output,
            error = error
        )
    }

    private fun formatErrorDetail(error: String): String {
        return if (error.isNotBlank()) ": ${error.trim()}" else ""
    }

    private data class GitCommandResult(
        val exitCode: Int,
        val output: String,
        val error: String
    )
}
