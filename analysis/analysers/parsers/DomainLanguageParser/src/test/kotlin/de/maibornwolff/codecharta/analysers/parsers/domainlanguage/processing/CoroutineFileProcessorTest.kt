package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import java.io.File
import java.util.concurrent.atomic.AtomicInteger
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class CoroutineFileProcessorTest {
    @Test
    fun `should keep processing other files when one file throws during processing`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("ok1.kt"), File("broken.kt"), File("ok2.kt"))
        val basePath = "."
        val contentReader: (File) -> String = { "content" }
        val wordExtractor: (File, String) -> FileResult = { file, _ ->
            if (file.name == "broken.kt") {
                throw RuntimeException("parse failure")
            }
            FileResult.Processed(mapOf("word" to 1))
        }

        // Act
        val result = processor.processFilesIndividually(files, basePath, contentReader, wordExtractor)

        // Assert
        assertEquals(2, result.perFileWordCounts.size)
        assertEquals(listOf("broken.kt"), result.failedFiles)
    }

    @Test
    fun `should record files that throw while reading content as failed`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("readable.kt"), File("unreadable.kt"))
        val basePath = "."
        val contentReader: (File) -> String = { file ->
            if (file.name == "unreadable.kt") throw RuntimeException("read failure") else "content"
        }
        val wordExtractor: (File, String) -> FileResult = { _, _ -> FileResult.Processed(mapOf("word" to 1)) }

        // Act
        val result = processor.processFilesIndividually(files, basePath, contentReader, wordExtractor)

        // Assert
        assertEquals(1, result.perFileWordCounts.size)
        assertEquals(listOf("unreadable.kt"), result.failedFiles)
    }

    @Test
    fun `should advance progress callback even for failed files`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("ok.kt"), File("broken.kt"))
        val callbackCount = AtomicInteger()
        val contentReader: (File) -> String = { "content" }
        val wordExtractor: (File, String) -> FileResult = { file, _ ->
            if (file.name == "broken.kt") throw RuntimeException("boom") else FileResult.Processed(emptyMap())
        }

        // Act
        processor.processFilesIndividually(files, ".", contentReader, wordExtractor) {
            callbackCount.incrementAndGet()
        }

        // Assert
        assertEquals(2, callbackCount.get())
    }

    @Test
    fun `should report no failed files when all files process successfully`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("a.kt"), File("b.kt"))
        val contentReader: (File) -> String = { "content" }
        val wordExtractor: (File, String) -> FileResult = { _, _ -> FileResult.Processed(mapOf("word" to 1)) }

        // Act
        val result = processor.processFilesIndividually(files, ".", contentReader, wordExtractor)

        // Assert
        assertTrue(result.failedFiles.isEmpty())
    }

    @Test
    fun `should track skipped files in processFilesIndividually`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("test.kt"), File("readme.md"), File("config.yml"))
        val basePath = "."
        val contentReader: (File) -> String = { "content" }
        val wordExtractor: (File, String) -> FileResult = { file, _ ->
            when (file.extension) {
                "kt" -> FileResult.Processed(mapOf("kotlin" to 1))
                else -> FileResult.Skipped(file.extension)
            }
        }

        // Act
        val result = processor.processFilesIndividually(files, basePath, contentReader, wordExtractor)

        // Assert
        assertEquals(1, result.perFileWordCounts.size)
        assertEquals(2, result.skippedExtensions.size)
        assertEquals(1, result.skippedExtensions["md"])
        assertEquals(1, result.skippedExtensions["yml"])
    }

    @Test
    fun `should process empty file list individually`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = emptyList<File>()
        val contentReader: (File) -> String = { "" }
        val wordExtractor: (File, String) -> FileResult = { _, _ -> FileResult.Processed(emptyMap()) }

        // Act
        val result = processor.processFilesIndividually(files, ".", contentReader, wordExtractor)

        // Assert
        assertEquals(0, result.perFileWordCounts.size)
        assertEquals(0, result.skippedExtensions.size)
    }

    @Test
    fun `should call onFileProcessed callback for each file`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("test1.kt"), File("test2.kt"), File("test3.kt"))
        val basePath = "."
        val callbackCount = AtomicInteger()
        val contentReader: (File) -> String = { "content" }
        val wordExtractor: (File, String) -> FileResult = { _, _ ->
            FileResult.Processed(mapOf("word" to 1))
        }

        // Act
        processor.processFilesIndividually(files, basePath, contentReader, wordExtractor) {
            callbackCount.incrementAndGet()
        }

        // Assert
        assertEquals(3, callbackCount.get())
    }

    @Test
    fun `should store word counts per file path`() {
        // Arrange
        val processor = CoroutineFileProcessor()
        val files = listOf(File("/base/test1.kt"), File("/base/test2.kt"))
        val basePath = "/base"
        val contentReader: (File) -> String = { file ->
            when (file.name) {
                "test1.kt" -> "hello world"
                "test2.kt" -> "hello kotlin"
                else -> ""
            }
        }
        val wordExtractor: (File, String) -> FileResult = { _, content ->
            FileResult.Processed(content.split(" ").groupingBy { it }.eachCount())
        }

        // Act
        val result = processor.processFilesIndividually(files, basePath, contentReader, wordExtractor)

        // Assert
        assertEquals(2, result.perFileWordCounts.size)
        assertEquals(mapOf("hello" to 1, "world" to 1), result.perFileWordCounts["test1.kt"])
        assertEquals(mapOf("hello" to 1, "kotlin" to 1), result.perFileWordCounts["test2.kt"])
    }
}
