package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.Logger
import io.mockk.called
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import kotlin.io.path.absolute
import kotlin.io.path.createTempDirectory
import kotlin.test.assertTrue

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ProjectSerializerTest {
    private val tempDir = createTempDirectory()
    private val filename = tempDir.absolute().toString() + "test.cc.json"
    private val project = Project("test")
    private val lambdaSlot = mutableListOf<() -> String>()

    companion object {
        private const val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    }

    @BeforeAll
    fun beforeTests() {
        mockkObject(Logger)
        every { Logger.info(capture(lambdaSlot)) } returns Unit
    }

    @BeforeEach
    fun beforeTest() {
        lambdaSlot.clear()
    }

    @AfterAll
    fun afterTests() {
        unmockkAll()
    }

    @Test
    fun `should correctly serialize the specified project when provided as input`() {
        // given
        val jsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3)!!.reader()
        // The 1.5 wire mapper stamps the version it actually emits, so a 1.3-origin project is
        // re-serialized as 1.5 (review finding #7, FAIL-15VER). Compare the meaningful `data` payload
        // with apiVersion restamped to 1.5; the wrapper checksum is just MD5(data) and is covered by
        // the dedicated checksum tests.
        val expectedData =
            JsonParser
                .parseString(this.javaClass.classLoader.getResource("example_api_version_1.3.cc.json")!!.readText())
                .asJsonObject
                .getAsJsonObject("data")
        expectedData.addProperty("apiVersion", "1.5")
        val testProject = ProjectDeserializer.deserializeProject(jsonReader)

        // when
        ProjectSerializer.serializeProject(testProject, FileOutputStream(filename), false, apiVersion = ApiVersion.ONE_FIVE)
        val actualData = JsonParser.parseString(File(filename).readText()).asJsonObject.getAsJsonObject("data")

        // then
        JSONAssert.assertEquals(expectedData.toString(), actualData.toString(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should create compressed json file when output file is specified and compress is true`() {
        // given
        val outputFilePath = "test.cc.json"
        val outputFilePathCompressed = "test.cc.json.gz"
        val outputFile = File(outputFilePathCompressed)
        outputFile.deleteOnExit()
        val mockStream = mockk<OutputStream>()

        // when
        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, mockStream, true)

        // then
        assertTrue {
            outputFile.exists()
        }
        verify {
            mockStream wasNot called
        }
    }

    @Test
    fun `should create uncompressed json file when output file is specified and compress is false`() {
        // given
        val outputFilePath = "test.cc.json"
        val outputFile = File(outputFilePath)
        val absoluteOutputFilePath = outputFile.absolutePath
        outputFile.deleteOnExit()
        val mockStream = mockk<OutputStream>()

        // when
        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, mockStream, false)

        // then
        assertTrue {
            outputFile.exists()
        }
        // then
        Assertions.assertThat(lambdaSlot.last()().endsWith(absoluteOutputFilePath)).isTrue()
    }

    @Test
    fun `should write to stream when outputFilePath is empty`() {
        // given
        val stream = ByteArrayOutputStream()

        // when
        ProjectSerializer.serializeToFileOrStream(project, "", stream, true)
        val result = stream.toString("UTF-8")

        // then
        assertTrue {
            result.startsWith("{")
        }
    }

    @Test
    fun `should log the absolute path of the output file when output file is specified`() {
        // given
        val outputFilePath = "src/test/resources/output.cc.json"
        val outputFile = File(outputFilePath)
        val absoluteOutputFilePath = outputFile.absolutePath
        outputFile.deleteOnExit()
        val mockStream = mockk<OutputStream>()

        // when
        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, mockStream, false)

        // then
        Assertions.assertThat(lambdaSlot.last()().endsWith(absoluteOutputFilePath)).isTrue()
    }

    @Test
    fun `should include checksum in serialized json`() {
        // given
        val sampleChecksum = "abc123def456"
        val rootNode = MutableNode("root", NodeType.Folder)
        val fileNode = MutableNode(
            name = "TestFile.java",
            type = NodeType.File,
            attributes = mapOf("rloc" to 100),
            checksum = sampleChecksum
        )
        rootNode.children.add(fileNode)
        val testProject = ProjectBuilder(listOf(rootNode)).build()

        // when
        val stream = ByteArrayOutputStream()
        ProjectSerializer.serializeProject(testProject, stream, false)
        val serializedJson = stream.toString("UTF-8")

        // then the per-file checksum is carried as contentHash on the 2.0 file node
        Assertions.assertThat(serializedJson).contains("\"contentHash\":\"$sampleChecksum\"")
    }
}
