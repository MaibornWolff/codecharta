package de.maibornwolff.codecharta.analysers.parsers.gitlog.util

import java.io.File
import java.util.concurrent.TimeUnit

class GitAdapter(private val gitDirectory: File, private val fileHandle: File) {
    fun getGitLog() {
        // `-c core.quotepath=off` keeps non-ASCII paths (e.g. an emoji-named file) unquoted and raw, so
        // the log and the ls-files listing agree on the same spelling. Both invocations MUST carry the
        // flag together: quoting only one side makes the names mismatch and the file loses its git metrics.
        val process = ProcessBuilder("git", "-c", "core.quotepath=off", "log", "--numstat", "--raw", "--topo-order", "--reverse", "-m")
        executeProcess(process)
    }

    fun getGitFiles() {
        val process = ProcessBuilder("git", "-c", "core.quotepath=off", "ls-files")
        executeProcess(process)
    }

    private fun executeProcess(process: ProcessBuilder) {
        process.directory(gitDirectory)
        process.redirectOutput(fileHandle)
        val runningProcess = process.start()
        if (runningProcess.waitFor(3, TimeUnit.MINUTES)) {
            val exitCode = runningProcess.exitValue()
            if (exitCode != 0) {
                throw RuntimeException(
                    "Error while executing Git! Command was: ${process.command()}. Process returned with exit status $exitCode."
                )
            }
        }
    }
}
