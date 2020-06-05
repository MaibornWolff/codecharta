import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class ParseFileToJson {
    private val resource = "src/test/resources/ScriptShellSample.java"
    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=json"))
    }

    @Test
    fun `json output has one root node`() {
        assertThat(outputStream).containsOnlyOnce(""""name":"root"""")
    }

    @Test
    fun `json output has java file`() {
        assertThat(outputStream).contains(""""name":"ScriptShellSample.java"""")
    }

    @Test
    fun `json output has correct lines of code`() {
        assertThat(outputStream).containsOnlyOnce("""rloc":29""")
    }

    @Test
    fun `json output has correct real lines of code`() {
        assertThat(outputStream).containsOnlyOnce("""mcc":6""")
    }

    @Test
    fun `json output has correct complexity`() {
        assertThat(outputStream).containsOnlyOnce("""functions":4""")
    }
}