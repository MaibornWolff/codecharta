package de.maibornwolff.codecharta.progresstracker

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class ProgressTrackerTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @BeforeEach
    fun setUp() {
        System.setErr(PrintStream(errContent))
        errContent.reset()
    }

    @AfterEach
    fun tearDown() {
        System.setErr(originalErr)
    }

    @Test
    fun `should show 0 percent progress at the start`() {
        // Given
        val progressTracker = ProgressTracker()
        val total = 100L
        val parsed = 0L
        val unit = "files"

        // When
        progressTracker.updateProgress(total, parsed, unit)

        // Then
        val output = errContent.toString()
        assertThat(output).contains("0% [>" + " ".repeat(100) + "]   0/100 files, ETA: N/A")
    }

    @Test
    fun `should show 50 percent progress at halfway point`() {
        // Given
        val progressTracker = ProgressTracker()
        val total = 100L
        val parsed = 50L
        val unit = "files"
        progressTracker.updateProgress(total, 1L, unit)

        // When
        progressTracker.updateProgress(total, parsed, unit)

        // Then
        val output = errContent.toString()
        assertThat(output).contains("50% [" + "=".repeat(50) + ">" + " ".repeat(50) + "]  50/100 files, ETA: 00:00:00")
    }

    @Test
    fun `should show 100 percent progress when complete`() {
        // Given
        val progressTracker = ProgressTracker()
        val total = 100L
        val parsed = 100L
        val unit = "files"

        // When
        progressTracker.updateProgress(total, parsed, unit)

        // Then
        val output = errContent.toString()
        assertThat(output).contains("100% [" + "=".repeat(100) + ">] 100/100 files, ETA: 00:00:00")
    }

    @Test
    fun `should show filename when provided`() {
        // Given
        val progressTracker = ProgressTracker()
        val total = 100L
        val parsed = 25L
        val unit = "files"
        val filename = "test-file.txt"

        // When
        progressTracker.updateProgress(total, parsed, unit, filename)

        // Then
        val output = errContent.toString()
        assertThat(output).contains(
            "25% [" + "=".repeat(25) + ">" + " ".repeat(75) + "]  25/100 files, ETA: 00:00:00 parsed file: $filename"
        )
    }

    @Test
    fun `should handle clearing spaces correctly when filename changes`() {
        // Given
        val progressTracker = ProgressTracker()
        val total = 100L
        val unit = "files"
        val longFilename = "this-is-a-very-long-filename.txt"
        val shortFilename = "short.txt"

        // When
        progressTracker.updateProgress(total, 25L, unit, longFilename)
        progressTracker.updateProgress(total, 50L, unit, shortFilename)

        // Then
        val output = errContent.toString()
        val expectedFirstLine =
            "25% [" + "=".repeat(25) + ">" + " ".repeat(75) + "]  25/100 files, ETA: 00:00:00 parsed file: $longFilename"
        val expectedSecondLineBase =
            "50% [" + "=".repeat(50) + ">" + " ".repeat(50) + "]  50/100 files, ETA: 00:00:00 parsed file: $shortFilename"
        val clearingSpaces = " ".repeat(longFilename.length - shortFilename.length)

        assertThat(output).contains(expectedFirstLine)
        assertThat(output).contains(expectedSecondLineBase + clearingSpaces)
    }

    @Test
    fun `should handle zero total correctly`() {
        // Given
        val progressTracker = ProgressTracker()
        val total = 0L
        val parsed = 0L
        val unit = "files"

        // When
        progressTracker.updateProgress(total, parsed, unit)

        // Then
        val output = errContent.toString()
        assertThat(output).isEmpty()
    }
}
