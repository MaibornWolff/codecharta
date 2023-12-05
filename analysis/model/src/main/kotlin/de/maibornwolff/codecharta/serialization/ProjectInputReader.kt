package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParserSyncFlag
import java.io.BufferedInputStream
import java.io.InputStream
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.util.Scanner

object ProjectInputReader {
    /**
     * Extracts a JSON string representing a project from the given InputStream.
     * Because piped bash commands run concurrently, pipeable ccsh-parser send a sync flag
     * to signal other parsers to check for piped input.
     * A short wait ensures the availability of potential sync flags.
     *
     * @param input InputStream with serialized project data.
     * @return JSON string of the project, or an empty string if no valid data is found.
     */
    fun extractProjectString(input: InputStream): String {
        Thread.sleep(100)
        val availableBytes = input.available()

        if (availableBytes <= 0) {
            return ""
        }
        if (!input.markSupported()) {
            return extractProjectString(BufferedInputStream(input))
        }

        val isSyncSignalContained = isSyncSignalContained(input, availableBytes)
        val isProjectAtFrontOfStream = isJsonObjectAtFrontOfStream(input, availableBytes)

        if (!isSyncSignalContained and !isProjectAtFrontOfStream) {
            return ""
        }

        val scanner = Scanner(input)
        val stringBuilder = StringBuilder()

        while (scanner.hasNextLine()) {
            stringBuilder.append(scanner.nextLine())
        }

        return extractJsonObjectFromEndOfStream(stringBuilder.toString())
    }

    private fun isSyncSignalContained(input: InputStream, availableBytes: Int): Boolean {
        val maxBufferSize = 1024
        val bufferSize = minOf(availableBytes, maxBufferSize)
        val buffer = ByteArray(bufferSize)
        input.mark(bufferSize)
        input.read(buffer, 0, bufferSize)

        val syncFlag = PipeableParserSyncFlag.SYNC_FLAG.value
        val syncSignalBytes = syncFlag.toByteArray()
        input.reset()
        return isSubarray(syncSignalBytes, buffer)
    }

    private fun isJsonObjectAtFrontOfStream(input: InputStream, availableBytes: Int): Boolean {
        input.mark(availableBytes)
        val buffer = CharArray(availableBytes)
        val reader = InputStreamReader(input, StandardCharsets.UTF_8)
        val bytesRead = reader.read(buffer, 0, availableBytes)
        val content = StringBuilder().appendRange(buffer, 0, bytesRead).toString()
        val openingBracket = "{".toCharArray()[0]
        val closingBracket = "}".toCharArray()[0]
        val lastClosingBracketIndex = content.lastIndexOf(closingBracket)
        val firstOpeningBracketIndex = content.lastIndexOf(openingBracket)
        input.reset()
        return firstOpeningBracketIndex == 0 && lastClosingBracketIndex == -1
    }

    private fun extractJsonObjectFromEndOfStream(streamContent: String): String {
        var count = 0
        val openingBracket = "{".toCharArray()[0]
        val closingBracket = "}".toCharArray()[0]
        val lastClosingBracketIndex = streamContent.lastIndexOf(closingBracket)
        if (lastClosingBracketIndex == -1) {
            return streamContent
        }

        var index = lastClosingBracketIndex
        while (index >= 0) {
            when (streamContent[index]) {
                closingBracket -> count++
                openingBracket -> count--
            }
            if (count == 0) {
                break
            }
            index--
        }

        return if (count == 0) {
            streamContent.substring(index, lastClosingBracketIndex + 1)
        } else {
            streamContent
        }
    }

    private fun isSubarray(subarray: ByteArray, buffer: ByteArray): Boolean {
        for (i in 0 until buffer.size - subarray.size + 1) {
            if (buffer.copyOfRange(i, i + subarray.size).contentEquals(subarray)) {
                return true
            }
        }
        return false
    }

}
