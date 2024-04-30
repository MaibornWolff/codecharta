import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ParseFileToJson {
    private val resource = "src/test/resources/ScriptShellSample.java"

    private val output =
        retrieveStreamAsString {
            SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=json", "-nc"))
        }

    @Test
    fun `json output has one root node`() {
        assertThat(output).containsOnlyOnce(""""name":"root"""")
    }

    @Test
    fun `json output has java file`() {
        assertThat(output).contains(""""name":"ScriptShellSample.java"""")
    }

    @Test
    fun `json output has correct real lines of code`() {
        assertThat(output).containsOnlyOnce("""rloc":29""")
    }

    @Test
    fun `json output has correct sonar complexity`() {
        assertThat(output).containsOnlyOnce("""complexity (formerly mcc)":6""")
    }

    @Test
    fun `json output has correct function complexity`() {
        assertThat(output).containsOnlyOnce("""functions":4""")
    }
}
