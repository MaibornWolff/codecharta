package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParserSyncFlag
import java.io.BufferedInputStream
import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.util.Scanner

object ProjectInputReader {
    /**
     * Extracts a JSON string representing a project from the given InputStream.
     * Because piped bash commands run concurrently, a pipeable ccsh-parser sends a sync flag
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

        if (isSyncSignalContained) {
            val scanner = Scanner(input)
            val stringBuilder = StringBuilder()

            while (scanner.hasNextLine()) {
                stringBuilder.append(scanner.nextLine())
            }

            return extractJsonObjectFromEndOfStream(stringBuilder.toString())
        }

        val charBuffer = CharArray(1024)
        val reader = BufferedReader(InputStreamReader(input, StandardCharsets.UTF_8))
        val stringBuilder = StringBuilder()
        while (reader.ready()) {
            val bytesRead = reader.read(charBuffer)
            stringBuilder.appendRange(charBuffer, 0, bytesRead)
        }
        val content = stringBuilder.toString()
        return content.replace(Regex("[\\n\\r]"), "")
    }

    private fun isSyncSignalContained(input: InputStream, availableBytes: Int): Boolean {

        val bufferSize = minOf(availableBytes, 1024)
        val buffer = ByteArray(bufferSize)
        input.mark(bufferSize)
        input.read(buffer, 0, bufferSize)

        val syncFlag = PipeableParserSyncFlag.SYNC_FLAG.value
        val syncSignalBytes = syncFlag.toByteArray()
        input.reset()
        return isSubarray(syncSignalBytes, buffer)
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
