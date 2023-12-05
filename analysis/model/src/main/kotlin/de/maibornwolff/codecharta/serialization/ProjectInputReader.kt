package de.maibornwolff.codecharta.serialization

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

        input.mark(availableBytes)
        val buffer = CharArray(availableBytes)
        val reader = InputStreamReader(input, StandardCharsets.UTF_8)
        val bytesRead = reader.read(buffer, 0, availableBytes)
        val content = StringBuilder().appendRange(buffer, 0, bytesRead).toString()
        val newLineCharacter = '\n'
        if (content[content.length - 1] == newLineCharacter) {
            return content.replace(newLineCharacter.toString(), "")
        }
        input.reset()

        val scanner = Scanner(input)
        val stringBuilder = StringBuilder()

        while (scanner.hasNextLine()) {
            stringBuilder.append(scanner.nextLine())
        }

        return stringBuilder.toString()
    }
}
