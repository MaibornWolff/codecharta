package de.maibornwolff.codecharta.importer.tokeiimporter

import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter.Companion.mainWithInOut
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.Ignore
import org.junit.jupiter.api.Test
import java.io.*

class TokeiImporterTest {
    @Test
    fun `reads tokei from file`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_results.json", "--pathSeparator=\\"))

        Assertions.assertThat(cliResult).contains(listOf("TokeiImporter", "CHANGELOG.md", "\"loc\":450"))
    }

    @Test
    fun `reads tokei piped input`() {
        val input = File("src/test/resources/tokei_results.json").bufferedReader().readLines().joinToString(separator = "") { it }

        val cliResult = executeForOutput(input, arrayOf("--pathSeparator=\\"))

        Assertions.assertThat(cliResult).contains(listOf("TokeiImporter", "CHANGELOG.md", "\"loc\":450"))
    }

    @Test
    fun `projectStructure is correct`() {
        val input = File("src/test/resources/tokei_results.json").bufferedReader().readLines().joinToString(separator = "") { it }

        val cliResult = executeForOutput(input, arrayOf("--pathSeparator=\\"))

        val project = ProjectDeserializer.deserializeProjectString(cliResult)
        Assertions.assertThat(project.rootNode.children.size).isEqualTo(3)
        Assertions.assertThat(project.rootNode.children[0].name).isEqualTo("CHANGELOG.md")
        Assertions.assertThat(project.rootNode.children[0].attributes["loc"]).isEqualTo(450.0)
        Assertions.assertThat(project.rootNode.children[2].name).isEqualTo("src")
        Assertions.assertThat(project.rootNode.children[2].size).isEqualTo(3)
    }

    @Ignore
    @Test
    fun `reads project piped input multiline`() {
        val input = File("src/test/resources/tokei_results.json").bufferedReader().readLines().joinToString(separator = "\n") { it }
        val cliResult = executeForOutput(input, arrayOf("-r=/does/not/exist"))

        Assertions.assertThat(cliResult).contains(listOf("TokeiImporter", "CHANGELOG.md", "\"loc\":450"))
    }

    @Test
    fun `sets project name`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_with_root.json", "-p=myProject"))

        val project = ProjectDeserializer.deserializeProjectString(cliResult)
        Assertions.assertThat(project.projectName).isEqualTo("myProject")
    }

    @Test
    fun `sets root correctly`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_with_root.json", "-r=foo/bar"))

        val project = ProjectDeserializer.deserializeProjectString(cliResult)
        Assertions.assertThat(project.rootNode.children[0].name).isEqualTo("CHANGELOG.md")
    }

    @Test
    fun `handles path separator correctly`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_results.json", "--pathSeparator=\\"))

        val project = ProjectDeserializer.deserializeProjectString(cliResult)
        Assertions.assertThat(project.rootNode.children[1].name).isEqualTo("foo")
    }
}

fun executeForOutput(input: String, args: Array<String> = emptyArray()) =
        outputAsString(input) { inputStream, outputStream, errorStream ->
            mainWithInOut(inputStream, outputStream, errorStream, args)
        }

fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        outputAsString(ByteArrayInputStream(input.toByteArray()), aMethod)

fun outputAsString(
        inputStream: InputStream = System.`in`,
        aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        ByteArrayOutputStream().use { baOutputStream ->
            PrintStream(baOutputStream).use { outputStream ->
                aMethod(inputStream, outputStream, System.err)
            }
            baOutputStream.toString()
        }