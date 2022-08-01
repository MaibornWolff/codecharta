package de.maibornwolff.codecharta.serialization

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class OutputFileHandlerTest {

    @Test
    fun checkAndFixFileExtensionWithJson() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test.json")
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionWithCCJson() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test.cc.json")
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionWithoutExtension() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test")
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionDefault() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("")
        assertEquals("default.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithFilenameBackslash() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService")
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithoutFilenameBackslash() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\")
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithoutFilename2() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("")
        assertEquals("default.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndSuffix() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name.cc.json")
        assertEquals("my.long.map.name.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndWithoutSuffix() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name")
        assertEquals("my.long.map.name.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithDotsAndJson() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("my.long.map.name.json")
        assertEquals("my.long.map.name.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithNDotsBeforeAfterFilename() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("...d....test...g.....")
        assertEquals("d....test...g.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathFilenameWithNDotsAfterFilename() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("test......")
        assertEquals("test.cc.json", correctFilename)
    }
}
