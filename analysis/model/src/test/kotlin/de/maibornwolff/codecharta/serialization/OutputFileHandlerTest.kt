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
    fun checkAndFixFileExtensionPathWithFilename() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt")
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithoutFilename() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\")
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service\\default.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithoutFilename2() {
        val correctFilename = OutputFileHandler.checkAndFixFileExtension("")
        assertEquals("default.cc.json", correctFilename)
    }
}
