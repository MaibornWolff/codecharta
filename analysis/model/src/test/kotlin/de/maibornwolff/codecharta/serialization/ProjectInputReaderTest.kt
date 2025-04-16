package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import java.io.PipedInputStream
import java.io.PipedOutputStream
import java.nio.charset.StandardCharsets
import java.util.concurrent.TimeUnit

@Timeout(value = 15, unit = TimeUnit.SECONDS)
class ProjectInputReaderTest {
    @Test
    fun `Should not wait for input when pipeable parser sync flag is not set`() {
        // given
        val line1 = "line1"
        val line2 = "line2"
        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))

        // when
        Thread {
            Thread.sleep(5000)
            outputStream.write(line2.toByteArray(StandardCharsets.UTF_8))
            outputStream.close()
        }.start()

        val linesRead = ProjectInputReader.extractProjectString(inputStream)

        // then
        Assertions.assertThat(linesRead).isEqualTo(line1)
    }

    @Test
    fun `Should wait for input when pipeable parser sync flag is set`() {
        // given
        val syncFlag = CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG
        val line1 = "{\"data\":\"data\"}"
        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(syncFlag.toByteArray(StandardCharsets.UTF_8))

        // when
        Thread {
            Thread.sleep(5000)
            outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))
            outputStream.close()
        }.start()

        val linesRead = ProjectInputReader.extractProjectString(inputStream)

        // then
        assertEquals(line1, linesRead)
    }

    @Test
    fun `Should discard newline characters when input contains newline characters`() {
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
        outputStream.close()

        // when
        val linesRead = ProjectInputReader.extractProjectString(inputStream)

        // then
        Assertions.assertThat(linesRead).isEqualTo(line1 + line2)
    }

    @Test
    fun `Should discard input before project string when project comes at end of stream`() {
        // given
        val syncFlag = CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG
        val line1 = "line1"
        val line2 = "{\"data\":\"data\"}"

        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(syncFlag.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(line1.toByteArray(StandardCharsets.UTF_8))
        outputStream.write(line2.toByteArray(StandardCharsets.UTF_8))
        outputStream.close()

        // when
        val linesRead = ProjectInputReader.extractProjectString(inputStream)

        // then
        Assertions.assertThat(linesRead).isEqualTo(line2)
    }

    @Test
    fun `Should return stream content when no valid project at end of stream`() {
        // given
        val invalidProjectData = "data\":\"data\"}"

        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(invalidProjectData.toByteArray(StandardCharsets.UTF_8))
        outputStream.close()

        // when
        val linesRead = ProjectInputReader.extractProjectString(inputStream)

        // then
        Assertions.assertThat(linesRead).isEqualTo(invalidProjectData)
    }
}
