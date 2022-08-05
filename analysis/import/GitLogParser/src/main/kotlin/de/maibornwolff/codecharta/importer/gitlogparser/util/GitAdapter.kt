package de.maibornwolff.codecharta.importer.gitlogparser.util

import java.io.File
import java.util.concurrent.TimeUnit
import java.util.stream.Stream

class GitAdapter(private val gitDirectory: String) {

    fun getGitLog(): Stream<String> {
        val output = mutableListOf<String>()
        val process = ProcessBuilder(
                "git", "ls-files")
        process.directory(File(gitDirectory))
        val runningProcess = process.start()
        runningProcess.inputStream.reader(Charsets.UTF_8).use {
            output += it.readLines()
        }
        runningProcess.waitFor(10, TimeUnit.SECONDS)
        return output.stream()
    }

    fun isGitInstalled(): Boolean {
        val output = mutableListOf<String>()
        val process = ProcessBuilder(
                "git", "ls-files")
        process.directory(File(gitDirectory))
        val runningProcess = process.start()
        runningProcess.inputStream.reader(Charsets.UTF_8).use {
            output += it.readLines()
        }
        runningProcess.waitFor(10, TimeUnit.SECONDS)
        return true
    }

    fun getGitFiles(): List<String> {
        val output = mutableListOf<String>()
        val process = ProcessBuilder(
                "git", "ls-files")
        process.directory(File(gitDirectory))
        val runningProcess = process.start()
        runningProcess.inputStream.reader(Charsets.UTF_8).use {
            output += it.readLines()
        }
        runningProcess.waitFor(10, TimeUnit.SECONDS)
        return output
    }
}
