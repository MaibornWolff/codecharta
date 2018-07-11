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
        println(outputStream)
        assertThat(outputStream.lines()[0]).containsOnlyOnce("apiVersion='1.0'")
    }

    @Test
    fun `json output has one root node`() {
        assertThat(outputStream.lines()[0]).containsOnlyOnce("MutableNode(name='root'")
    }

    @Test
    fun `json output has java file`() {
        assertThat(outputStream.lines()[0]).containsOnlyOnce("MutableNode(name='RealLinesShort.java'")
    }

    @Test
    @Throws(IOException::class)
    fun `json output has correct lines of code`() {
        assertThat(outputStream.lines()[0]).containsOnlyOnce("lines_of_code=7")
    }

    @Test
    @Throws(IOException::class)
    fun `json output has correct real lines of code`() {
        assertThat(outputStream.lines()[0]).containsOnlyOnce("rloc=5")
    }


}