package de.maibornwolff.codecharta.serialization

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import java.io.PipedInputStream
import java.io.PipedOutputStream
import java.nio.charset.StandardCharsets
import java.util.concurrent.TimeUnit

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Timeout(value = 10, unit = TimeUnit.SECONDS)
class ProjectInputReaderTest {
    @Test
    fun `Should not wait for input when handling blocking input stream`() {
        // given
        val line1 = "line1"
        val line2 = "line2"
        val newLine = "\n"
        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))

        // when
        Thread {
            Thread.sleep(5000)
            outputStream.write(line2.toByteArray(StandardCharsets.UTF_8))
            outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))
            outputStream.close()
        }.start()

        val linesRead = inputStream.readNonBlockingInput()

        // then
        assertEquals(line1, linesRead)
    }

    @Test
    fun `Should finish reading when encountering EOF in input stream`() {
        // given
        val line1 = "line1"
        val line2 = "line2"
        val line3 = "line3"
        val newLine = "\n"
        val expectedResult = buildString {
            append(line1)
            append(line2)
            append(line3)
        }
        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(line2.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(line3.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))

        // when
        val linesRead = inputStream.readNonBlockingInput()

        // then
        assertEquals(expectedResult, linesRead)
    }

    @Test
    fun `Should remove new line characters when provided with multiline input stream`() {
        // given
        val line1 = "line1"
        val line2 = "line2"
        val newLine = "\n"

        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(line2.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(newLine.toByteArray(StandardCharsets.UTF_8))

        // when
        val linesRead = inputStream.readNonBlockingInput()

        // then
        Assertions.assertThat(linesRead).doesNotContain(newLine)
    }
}
