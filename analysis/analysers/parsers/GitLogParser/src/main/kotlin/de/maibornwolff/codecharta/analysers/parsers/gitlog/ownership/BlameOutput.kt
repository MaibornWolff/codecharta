package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import java.io.ByteArrayOutputStream
import java.io.InputStream

internal data class FileBlame(val linesByCommit: Map<String, Int>, val totalLines: Int)

/** Reads `git blame --line-porcelain`, where each line of the file is a header, its metadata and a tab-prefixed copy of the line. */
internal object BlameOutput {
    private const val CONTENT_PREFIX = '\t'.code
    private const val LINE_FEED = '\n'.code
    private const val END_OF_STREAM = -1
    private const val HEADER_SEPARATOR = ' '
    private const val UNCOMMITTED_HASH_DIGIT = '0'

    // Split on line feeds alone and never decode the copied lines: they are arbitrary file content, and a carriage
    // return inside one must not make the rest of it look like metadata.
    fun parse(input: InputStream): FileBlame {
        val buffered = input.buffered()
        val linesByCommit = HashMap<String, Int>()
        var totalLines = 0
        var isAtHeader = true
        var firstByte = buffered.read()
        while (firstByte != END_OF_STREAM) {
            when {
                firstByte == CONTENT_PREFIX -> {
                    totalLines++
                    isAtHeader = true
                    skipLine(buffered)
                }
                isAtHeader -> {
                    countCommit(readHash(firstByte, buffered), linesByCommit)
                    isAtHeader = false
                }
                else -> skipLine(buffered)
            }
            firstByte = buffered.read()
        }
        return FileBlame(linesByCommit, totalLines)
    }

    // Blame gives uncommitted lines an all-zero hash: they count for the file, but nobody made them yet
    private fun countCommit(hash: String, linesByCommit: MutableMap<String, Int>) {
        if (hash.any { it != UNCOMMITTED_HASH_DIGIT }) linesByCommit.merge(hash, 1, Int::plus)
    }

    private fun readHash(firstByte: Int, input: InputStream): String {
        val line = ByteArrayOutputStream()
        var current = firstByte
        while (current != LINE_FEED && current != END_OF_STREAM) {
            line.write(current)
            current = input.read()
        }
        return line.toString(Charsets.UTF_8).substringBefore(HEADER_SEPARATOR)
    }

    private fun skipLine(input: InputStream) {
        var current = input.read()
        while (current != LINE_FEED && current != END_OF_STREAM) {
            current = input.read()
        }
    }
}
