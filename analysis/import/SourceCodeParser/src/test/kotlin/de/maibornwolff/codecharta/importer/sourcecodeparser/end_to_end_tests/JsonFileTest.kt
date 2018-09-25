package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class JsonFileTest {

    private val resource = "src/test/resources/$end2EndFolder/miniJavaProject/mini/RealLinesShort.java"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=json"))
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
    fun `json output has correct lines of code`() {
        assertThat(outputStream).containsOnlyOnce("""lines_of_code":7""")
    }

    @Test
    fun `json output has correct real lines of code`() {
        assertThat(outputStream).containsOnlyOnce("""rloc":6""")
    }

    @Test
    fun `json output has correct complexity`() {
        assertThat(outputStream).containsOnlyOnce("""mcc":1""")
    }


}