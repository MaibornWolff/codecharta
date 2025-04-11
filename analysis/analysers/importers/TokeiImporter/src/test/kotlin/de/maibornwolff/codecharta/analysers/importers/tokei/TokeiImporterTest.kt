package de.maibornwolff.codecharta.analysers.importers.tokei

import de.maibornwolff.codecharta.analysers.importers.tokei.TokeiImporter.Companion.mainWithInOut
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TokeiImporterTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `reads tokei from file`() {
        val cliResult =
            executeForOutput("", arrayOf("src/test/resources/tokei_pre12_windows.json", "--path-separator=\\"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":450"))
    }

    @Test
    fun `reads tokei from file with double backslash separator to be unescaped`() {
        val cliResult =
            executeForOutput("", arrayOf("src/test/resources/tokei_pre12_windows.json", "--path-separator=\\\\"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":450"))
    }

    @Test
    fun `reads tokei from file without a path given`() {
        val cliResult =
            executeForOutput("", arrayOf("src/test/resources/tokei_pre12_windows.json", "--path-separator="))

        assertThat(cliResult)
            .contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":450", "\"name\":\"cli.rs\""))
    }

    @Test
    fun `reads tokei 12 from file without a path given`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_12_unix.json", "--path-separator="))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"rloc\":450"))
    }

    @Test
    fun `should default to unix path if minimal tokei given`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_pre12_minimal.json"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":450"))
    }

    @Test
    fun `should not crash on empty file with given tokei json`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_12_empty.json"))

        assertThat(cliResult).contains(listOf("\"name\":\"root\"", "\"children\":[]"))
    }

    @Test
    fun `should not crash on empty file with given tokei 12 json`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_pre12_empty.json"))

        assertThat(cliResult).contains(listOf("\"name\":\"root\"", "\"children\":[]"))
    }

    @Test
    fun `should default to unix path if minimal tokei 12 given`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_12_minimal.json"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"rloc\":450"))
    }

    @Test
    fun `reads tokei 12 new json scheme from file`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_12_unix.json"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"rloc\":450"))
    }

    @Test
    fun `tokei 12 should include the loc metric`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_12_unix.json"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":461"))
    }

    @Test
    fun `reads tokei piped input`() {
        val input =
            File("src/test/resources/tokei_pre12_unix_root.json").bufferedReader().readLines()
                .joinToString(separator = "") { it }

        val cliResult = executeForOutput(input)

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":450"))
    }

    @Test
    fun `projectStructure is correct`() {
        val input =
            File("src/test/resources/tokei_pre12_windows.json").bufferedReader().readLines()
                .joinToString(separator = "") { it }

        val cliResult = executeForOutput(input, arrayOf("--path-separator=\\"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.rootNode.children.size).isEqualTo(3)
        assertThat(project.rootNode.children.toMutableList()[0].name).isEqualTo("CHANGELOG.md")
        assertThat(project.rootNode.children.toMutableList()[0].attributes["loc"]).isEqualTo(450.0)
        assertThat(project.rootNode.children.toMutableList()[2].name).isEqualTo("src")
        assertThat(project.rootNode.children.toMutableList()[2].size).isEqualTo(3)
    }

    @Test
    fun `tokei 12 projectStructure is correct`() {
        val input =
            File("src/test/resources/tokei_12_unix.json").bufferedReader().readLines()
                .joinToString(separator = "") { it }

        val cliResult = executeForOutput(input)

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.rootNode.children.size).isEqualTo(2)
        assertThat(project.rootNode.name).isEqualTo("root")
        assertThat(project.rootNode.children.toMutableList()[0].name).isEqualTo("make_release.sh")
        assertThat(project.rootNode.children.toMutableList()[0].attributes["rloc"]).isEqualTo(500.0)
        assertThat(project.rootNode.children.toMutableList()[1].attributes["rloc"]).isNull()
        assertThat(project.rootNode.children.toMutableList()[1].name).isEqualTo("foo")
        assertThat(project.rootNode.children.toMutableList()[1].children.toMutableList().size).isEqualTo(2)
    }

    @Test
    fun `tokei pre 12 projectStructure is correct`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_pre12_unix_root.json", "-r=foo"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.rootNode.children.size).isEqualTo(1)
        assertThat(project.rootNode.name).isEqualTo("root")
        assertThat(project.rootNode.children.size).isEqualTo(1)
        assertThat(project.rootNode.children.first().name).isEqualTo("bar")
        assertThat(project.rootNode.children.first().children.size).isEqualTo(1)
        assertThat(project.rootNode.children.first().children.first().name).isEqualTo("CHANGELOG.md")
    }

    @Test
    fun `tokei projectStructure stays the same independent of execution place`() {
        // tokei . -o json --exclude "*.json" > src/test/resources/with_dot.json
        val cliResult1 = executeForOutput(
            "",
            arrayOf("src/test/resources/from_TokeiImporter_folder.json")
        )
        // tokei TokeiImporter -o json --exclude "*.json" > TokeiImporter/src/test/resources/one_folder_up.json;
        val cliResult2 = executeForOutput(
            "",
            arrayOf("src/test/resources/one_folder_up.json", "-r=TokeiImporter")
        )

        val project1 = ProjectDeserializer.deserializeProject(cliResult1)
        val project2 = ProjectDeserializer.deserializeProject(cliResult2)

        assertTrue(project1.rootNode.name == project2.rootNode.name)
        assertThat(project1.rootNode.children.size).isEqualTo(project2.rootNode.children.size)
        assertThat(project1.rootNode.children.map { it.name }).containsAll(project2.rootNode.children.map { it.name })
    }

    @Test
    fun `tokei projectStructure stays the same with and without dot`() {
        // tokei -o json --exclude "*.json" > src/test/resources/without_dot.json;
        val cliResult1 = executeForOutput(
            "",
            arrayOf("src/test/resources/without_dot.json")
        )
        // tokei . -o json --exclude "*.json" > src/test/resources/with_dot.json
        val cliResult2 = executeForOutput(
            "",
            arrayOf("src/test/resources/from_TokeiImporter_folder.json")
        )

        val project1 = ProjectDeserializer.deserializeProject(cliResult1)
        val project2 = ProjectDeserializer.deserializeProject(cliResult2)

        assertTrue(project1.rootNode.name == project2.rootNode.name)
        assertTrue(project1.rootNode.children.size == project2.rootNode.children.size)
        assertThat(project1.rootNode.children.map { it.name }).containsAll(project2.rootNode.children.map { it.name })
    }

    @Test
    fun `reads project piped input multiline`() {
        val input =
            File("src/test/resources/tokei_pre12_windows.json").bufferedReader().readLines()
                .joinToString(separator = "\n") { it }
        val cliResult = executeForOutput(input, arrayOf("-r=/does/not/exist"))

        assertThat(cliResult).contains(listOf("\"name\":\"CHANGELOG.md\"", "\"loc\":450"))
    }

    @Test
    fun `sets root correctly`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_pre12_unix_root.json", "-r=foo/bar"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.rootNode.children.toMutableList()[0].name).isEqualTo("CHANGELOG.md")
    }

    @Test
    fun `handles path separator correctly`() {
        val cliResult =
            executeForOutput("", arrayOf("src/test/resources/tokei_pre12_windows.json", "--path-separator=\\"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.rootNode.children.toMutableList()[1].name).isEqualTo("foo")
    }

    @Test
    fun `handles path separator correctly for version 12`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_12_unix.json", "--path-separator=/"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.rootNode.children.toMutableList()[1].name).isEqualTo("foo")
    }

    @Test
    fun `attributeTypes are set`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_pre12_unix_root.json", "-r=foo/bar"))
        val expected =
            mapOf(
                "comment_lines" to AttributeType.ABSOLUTE,
                "empty_lines" to AttributeType.ABSOLUTE,
                "loc" to AttributeType.ABSOLUTE,
                "rloc" to AttributeType.ABSOLUTE
            )

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.attributeTypes).containsKey("nodes")
        assertThat(project.attributeTypes["nodes"]).isEqualTo(expected)
    }

    @Test
    fun `should contain all attribute descriptors`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/tokei_pre12_unix_root.json", "-r=foo/bar"))

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.attributeDescriptors).isEqualTo(getAttributeDescriptors())
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(TokeiImporter()).execute("thisDoesNotExist.cc.json").toString()
        System.setErr(originalErr)

        assertThat(errContent.toString())
            .contains("Input invalid file for TokeiImporter, stopping execution")
    }
}

fun executeForOutput(input: String, args: Array<String> = emptyArray()) = outputAsString(input) { inputStream, outputStream, errorStream ->
    mainWithInOut(inputStream, outputStream, errorStream, args)
}

fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) = outputAsString(
    ByteArrayInputStream(input.toByteArray()),
    aMethod
)

fun outputAsString(inputStream: InputStream = System.`in`, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
    ByteArrayOutputStream().use { baOutputStream ->
        PrintStream(baOutputStream).use { outputStream ->
            aMethod(inputStream, outputStream, System.err)
        }
        baOutputStream.toString()
    }
