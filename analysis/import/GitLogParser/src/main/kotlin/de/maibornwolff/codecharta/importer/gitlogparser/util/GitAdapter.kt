package de.maibornwolff.codecharta.importer.gitlogparser.util

import java.io.File
import java.util.concurrent.TimeUnit

class GitAdapter(private val gitDirectory: File) {

    fun getGitLog(): List<String> {
        val process = ProcessBuilder("git", "log", "--numstat", "--raw", "--topo-order", "--reverse", "-m")
        return executeProcess(process)
    }

    fun getGitFiles(): List<String> {
        val process = ProcessBuilder("git", "ls-files")
        return executeProcess(process)
    }

    private fun executeProcess(process: ProcessBuilder): MutableList<String> {
        val output = mutableListOf<String>()
        process.directory(gitDirectory)
        val runningProcess = process.start()
        runningProcess.inputStream.reader(Charsets.UTF_8).use {
            output += it.readLines()
        }
        runningProcess.waitFor(3, TimeUnit.MINUTES)
        return output
    }
}
