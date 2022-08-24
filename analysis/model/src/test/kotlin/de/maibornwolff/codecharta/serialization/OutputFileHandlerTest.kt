package de.maibornwolff.codecharta.serialization

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class OutputFileHandlerTest {

    @Test
    fun checkAndFixFileExtensionWithJson() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test.json", false)
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionWithCCJson() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test.cc.json", false)
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionWithoutExtension() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test", false)
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithFilenameBackslash() {
        val correctFilename =
            OutputFileHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService", false)
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndSuffix() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name.cc.json", false)
        assertEquals("my.long.map.name.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndGzSuffix() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name.cc.json.gz", true)
        assertEquals("my.long.map.name.cc.json.gz", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionForCompressedOutput() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.test.name.cc.json", true)
        assertEquals("my.test.name.cc.json.gz", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndWithoutSuffix() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name", false)
        assertEquals("my.long.map.name.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndJson() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name.json", false)
        assertEquals("my.long.map.name.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithNDotsAfterFilename() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test......", false)
        assertEquals("test.......cc.json", correctFilename)
    }
}
