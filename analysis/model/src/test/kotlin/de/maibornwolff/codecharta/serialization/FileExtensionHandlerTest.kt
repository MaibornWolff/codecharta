package de.maibornwolff.codecharta.serialization

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class FileExtensionHandlerTest {

    @Test
    fun checkAndFixFileExtensionWithJson() {
        val correctFilename = FileExtensionHandler.checkAndFixFileExtension("test.json")
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionWithCCJson() {
        val correctFilename = FileExtensionHandler.checkAndFixFileExtension("test.cc.json")
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionWithoutExtension() {
        val correctFilename = FileExtensionHandler.checkAndFixFileExtension("test")
        assertEquals("test.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionDefault() {
        val correctFilename = FileExtensionHandler.checkAndFixFileExtension("")
        assertEquals("output.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithFilename() {
        val correctFilename = FileExtensionHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt")
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.cc.json", correctFilename)
    }

    @Test
    fun checkAndFixFileExtensionPathWithoutFilename() {
        val correctFilename = FileExtensionHandler.checkAndFixFileExtension("\\test-project\\path1\\test-project.path1.Logic\\Service\\")
        assertEquals("\\test-project\\path1\\test-project.path1.Logic\\Service\\output.cc.json", correctFilename)
    }
}
