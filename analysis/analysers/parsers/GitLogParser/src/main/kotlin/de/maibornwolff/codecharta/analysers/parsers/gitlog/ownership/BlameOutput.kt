package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import java.io.ByteArrayOutputStream
import java.io.InputStream

internal data class FileBlame(val linesByAuthor: Map<String, Int>, val totalLines: Int)

/** Reads `git blame --line-porcelain`, where each line of the file is a header, its metadata and a tab-prefixed copy of the line. */
internal object BlameOutput {
    private const val CONTENT_PREFIX = '\t'.code
    private const val LINE_FEED = '\n'.code
    private const val END_OF_STREAM = -1
    private const val AUTHOR_PREFIX = "author "
    private const val UNCOMMITTED_HASH_PREFIX = "0000000000000000000000000000000000000000"

    fun parse(input: InputStream): FileBlame {
        val linesByAuthor = HashMap<String, Int>()
        var totalLines = 0
        var isUncommitted = false
        forEachMetadataLine(input, onContentLine = {
            totalLines++
            isUncommitted = false
        }) { line ->
            if (line.startsWith(UNCOMMITTED_HASH_PREFIX)) isUncommitted = true
            if (line.startsWith(AUTHOR_PREFIX) && !isUncommitted) linesByAuthor.merge(line.removePrefix(AUTHOR_PREFIX), 1, Int::plus)
        }
        return FileBlame(linesByAuthor, totalLines)
    }

    // Split on line feeds alone and never decode the copied lines: they are arbitrary file content, and a carriage
    // return inside one must not make the rest of it look like metadata.
    private fun forEachMetadataLine(input: InputStream, onContentLine: () -> Unit, onMetadataLine: (String) -> Unit) {
        val buffered = input.buffered()
        val metadataLine = ByteArrayOutputStream()
        var firstByte = buffered.read()
        while (firstByte != END_OF_STREAM) {
            if (firstByte == CONTENT_PREFIX) {
                onContentLine()
                skipLine(buffered)
            } else {
                metadataLine.reset()
                var current = firstByte
                while (current != LINE_FEED && current != END_OF_STREAM) {
                    metadataLine.write(current)
                    current = buffered.read()
                }
                onMetadataLine(metadataLine.toString(Charsets.UTF_8))
            }
            firstByte = buffered.read()
        }
    }

    private fun skipLine(input: InputStream) {
        var current = input.read()
        while (current != LINE_FEED && current != END_OF_STREAM) {
            current = input.read()
        }
    }
}
