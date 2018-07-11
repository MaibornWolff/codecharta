package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_JsonFileTest {

    private val resource = "src/test/resources/$baseFolder/miniJavaProject/mini/RealLinesShort.java"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=json"))
    }

    @Test
    @Throws(IOException::class)
    fun `json output has correct api version`() {
        assertThat(outputStream).containsOnlyOnce(""""apiVersion":"1.0"""")
    }

    @Test
    fun `json output has one root node`() {
        assertThat(outputStream).containsOnlyOnce(""""name":"root"""")
    }

    @Test
    fun `json output has java file`() {
        assertThat(outputStream).containsOnlyOnce(""""name":"RealLinesShort.java"""")
    }

    @Test
    @Throws(IOException::class)
    fun `json output has correct lines of code`() {
        assertThat(outputStream).containsOnlyOnce("""lines_of_code":7""")
    }

    @Test
    @Throws(IOException::class)
    fun `json output has correct real lines of code`() {
        assertThat(outputStream).containsOnlyOnce("""rloc":5""")
    }


}