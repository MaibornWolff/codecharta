package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class FileDoesNotExistTest {

    private val resource = "src/test/resources/$end2EndFolder/folder/does/not/exist/Foo.java"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=table"))
    }

    @Test
    fun `prints working directory if file not found`() {
        assertThat(outputStream.lines()[0]).contains("working directory")
        assertThat(outputStream.lines()[1]).contains("Could not find")
    }

}