package de.maibornwolff.codecharta.serialization

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.io.PipedInputStream
import java.io.PipedOutputStream
import java.nio.charset.StandardCharsets

class PipedInputReaderTest {
    @Test
    fun `forEachLine should not wait for data when handling blocking input stream`() {
        // given
        val line1 = "line1"
        val line2 = "line2"
        val newLine = "\n"
        val expectedLines = listOf(line1)
        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))
        val lines = mutableListOf<String>()

        // when
        Thread {
            Thread.sleep(5000)
            outputStream.write(line2.toByteArray(StandardCharsets.UTF_8))
            outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))
            outputStream.close()
        }.start()

        inputStream.forEachLine {
            lines.add(it)
        }

        // then
        assertEquals(expectedLines, lines)
    }
}
