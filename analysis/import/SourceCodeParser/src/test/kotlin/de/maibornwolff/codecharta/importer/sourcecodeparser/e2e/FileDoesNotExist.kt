package de.maibornwolff.codecharta.importer.sourcecodeparser.e2e

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class FileDoesNotExist {
    private val resource = "src/test/resources/sampleproject/folder/does/not/exist/Foo.java"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithInOut(it, System.`in`, it, arrayOf(resource, "-out=table"))
    }

    @Test
    fun `prints working directory if file not found`() {
        assertThat(outputStream.lines()[0]).contains("working directory")
        assertThat(outputStream.lines()[1]).contains("Could not find")
    }
}