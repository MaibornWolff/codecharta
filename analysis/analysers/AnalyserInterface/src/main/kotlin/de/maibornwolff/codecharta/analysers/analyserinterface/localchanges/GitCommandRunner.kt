package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

import java.io.File
import java.util.concurrent.TimeUnit

class GitCommandRunner(private val repoRoot: File) {
    companion object {
        private const val GIT_TIMEOUT_MINUTES = 3L
    }

    fun run(vararg args: String): String {
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

    fun runAndParseFileList(vararg args: String): Set<String> {
        return parseFileList(run(*args))
    }

    private fun parseFileList(output: String): Set<String> {
        if (output.isBlank()) return emptySet()
        return output.lines()
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .toSet()
    }
}
