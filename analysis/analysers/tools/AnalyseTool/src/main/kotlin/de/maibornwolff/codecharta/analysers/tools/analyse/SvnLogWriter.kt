package de.maibornwolff.codecharta.analysers.tools.analyse

import java.io.File
import java.io.IOException

class SvnLogWriter(private val command: List<String> = SVN_LOG_COMMAND) {
    /** Returns why the log could not be written, or null once it is. */
    fun write(workingCopy: File, logFile: File): String? {
        val process =
            try {
                ProcessBuilder(command).directory(workingCopy).redirectOutput(logFile).start()
            } catch (exception: IOException) {
                return "the ${command.first()} command is not installed or not on the PATH"
            }
        val errors = process.errorStream.bufferedReader().readText()
        val exitCode = process.waitFor()
        if (exitCode == 0) return null
        val cause = errors.lineSequence().firstOrNull { it.isNotBlank() } ?: "it ended with exit code $exitCode"
        return "${command.joinToString(" ")} failed: $cause"
    }

    companion object {
        private val SVN_LOG_COMMAND = listOf("svn", "log", "--verbose", "--non-interactive")
    }
}
