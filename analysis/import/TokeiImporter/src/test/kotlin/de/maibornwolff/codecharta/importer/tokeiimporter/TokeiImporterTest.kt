package de.maibornwolff.codecharta.importer.tokeiimporter

import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter.Companion.mainWithInOut
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.Ignore
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.PrintStream

class TokeiImporterTest {
    @Test
    fun `reads tokei from file`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_results.json", "--path-separator=\\"))

        Assertions.assertThat(cliResult).contains(listOf("CHANGELOG.md", "\"loc\":450"))
    }

    @Test
    fun `reads tokei 12 new json scheme from file`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_without_inner.json"))

        Assertions.assertThat(cliResult).contains(listOf("CHANGELOG.md", "\"rloc\":450"))
    }

    @Test
    fun `tokei 12 should include the loc metric`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_without_inner.json"))

        Assertions.assertThat(cliResult).contains(listOf("CHANGELOG.md", "\"loc\":461"))
    }

    @Test
    fun `reads tokei piped input`() {
        val input = File("src/test/resources/tokei_with_root.json").bufferedReader().readLines().joinToString(separator = "") { it }

        val cliResult = executeForOutput(input, arrayOf())

        Assertions.assertThat(cliResult).contains(listOf("CHANGELOG.md", "\"loc\":450"))
    }

    @Test
    fun `projectStructure is correct`() {
        val input = File("src/test/resources/tokei_results.json").bufferedReader().readLines().joinToString(separator = "") { it }

        val cliResult = executeForOutput(input, arrayOf("--path-separator=\\"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        Assertions.assertThat(project.rootNode.children.size).isEqualTo(3)
        Assertions.assertThat(project.rootNode.children.toMutableList()[0].name).isEqualTo("CHANGELOG.md")
        Assertions.assertThat(project.rootNode.children.toMutableList()[0].attributes["loc"]).isEqualTo(450.0)
        Assertions.assertThat(project.rootNode.children.toMutableList()[2].name).isEqualTo("src")
        Assertions.assertThat(project.rootNode.children.toMutableList()[2].size).isEqualTo(3)
    }

    @Test
    fun `tokei 12 projectStructure is correct`() {
        val input = File("src/test/resources/tokei_without_inner.json").bufferedReader().readLines().joinToString(separator = "") { it }

        val cliResult = executeForOutput(input)

        val project = ProjectDeserializer.deserializeProject(cliResult)
        Assertions.assertThat(project.rootNode.children.size).isEqualTo(2)
        Assertions.assertThat(project.rootNode.children.toMutableList()[0].name).isEqualTo("make_release.sh")
        Assertions.assertThat(project.rootNode.children.toMutableList()[0].attributes["rloc"]).isEqualTo(500.0)
        Assertions.assertThat(project.rootNode.children.toMutableList()[1].attributes["rloc"]).isNull()
        Assertions.assertThat(project.rootNode.children.toMutableList()[1].name).isEqualTo("foo")
        Assertions.assertThat(project.rootNode.children.toMutableList()[1].children.toMutableList().size).isEqualTo(2)
    }

    @Ignore
    @Test
    fun `reads project piped input multiline`() {
        val input = File("src/test/resources/tokei_results.json").bufferedReader().readLines().joinToString(separator = "\n") { it }
        val cliResult = executeForOutput(input, arrayOf("-r=/does/not/exist"))

        Assertions.assertThat(cliResult).contains(listOf("CHANGELOG.md", "\"loc\":450"))
    }

    @Test
    fun `sets root correctly`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_with_root.json", "-r=foo/bar"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        Assertions.assertThat(project.rootNode.children.toMutableList()[0].name).isEqualTo("CHANGELOG.md")
    }

    @Test
    fun `handles path separator correctly`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_results.json", "--path-separator=\\"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        Assertions.assertThat(project.rootNode.children.toMutableList()[1].name).isEqualTo("foo")
    }

    @Test
    fun `attributeTypes are set`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_with_root.json", "-r=foo/bar"))
        val expected = mapOf("comment_lines" to "absolute", "empty_lines" to "absolute", "loc" to "absolute", "rloc" to "absolute")

        val project = ProjectDeserializer.deserializeProject(cliResult)

        Assertions.assertThat(project.attributeTypes).containsKey("nodes")
        Assertions.assertThat(project.attributeTypes["nodes"]).isEqualTo(expected)
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
    aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit
) =
    ByteArrayOutputStream().use { baOutputStream ->
        PrintStream(baOutputStream).use { outputStream ->
            aMethod(inputStream, outputStream, System.err)
        }
        baOutputStream.toString()
    }
