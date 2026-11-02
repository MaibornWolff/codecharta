package de.maibornwolff.codecharta.analysers.parsers.gitlog.util

import java.io.File
import java.io.InputStream

internal class GitCommand(private val repositoryFolder: File) {
    fun <T> outputOrNull(vararg arguments: String, input: File = EMPTY_INPUT, read: (InputStream) -> T): T? {
        val process = ProcessBuilder(listOf("git") + arguments)
            .directory(repositoryFolder)
            .redirectInput(ProcessBuilder.Redirect.from(input))
            .redirectError(ProcessBuilder.Redirect.DISCARD)
            .start()
        val result = process.inputStream.use(read)
        return result.takeIf { process.waitFor() == 0 }
    }

    fun isShallowClone(): Boolean = outputOrNull("rev-parse", "--is-shallow-repository") { it.bufferedReader().readText().trim() } == "true"

    /** What git records for every file at HEAD, one `added<TAB>removed<TAB>path` each, which is how it tells binary files apart. */
    fun numstatOfHead(): List<String> {
        val emptyTree = outputOrNull("hash-object", "-t", "tree", "--stdin") { it.bufferedReader().readText().trim() } ?: return emptyList()
        return outputOrNull("diff", "--numstat", "-z", "--no-renames", "--relative", emptyTree, "HEAD", read = ::nulSeparated).orEmpty()
    }

    fun nulSeparated(output: InputStream): List<String> = output.readBytes().toString(Charsets.UTF_8).split(NUL).filter { it.isNotEmpty() }

    companion object {
        private const val NUL = "\u0000"
        private val EMPTY_INPUT = File(if (System.getProperty("os.name").startsWith("Windows")) "NUL" else "/dev/null")
    }
}
