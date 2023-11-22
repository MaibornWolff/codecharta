package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import io.mockk.called
import io.mockk.mockk
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.io.PrintStream
import kotlin.io.path.absolute
import kotlin.io.path.createTempDirectory
import kotlin.test.assertTrue

class ProjectSerializerTest {
    private val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    private val tempDir = createTempDirectory()
    private val filename = tempDir.absolute().toString() + "test.cc.json"
    private val project = mockk<Project>()
    private var outContent = ByteArrayOutputStream()
    private val originalOut = System.out

    @AfterEach
    fun afterTest() {
        unmockkAll()
        outContent = ByteArrayOutputStream()
    }

    @Test
    fun `should serialize project`() {
        // given
        val jsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3)!!.reader()
        val expectedJsonString = this.javaClass.classLoader.getResource("example_api_version_1.3.cc.json")!!.readText()
        val testProject = ProjectDeserializer.deserializeProject(jsonReader)

        // when
        ProjectSerializer.serializeProject(testProject, FileOutputStream(filename), false)
        val testJsonString = File(filename).readText()

        // then
        JSONAssert.assertEquals(testJsonString, expectedJsonString, JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `serializeToFileOrStream should create a gz file`() {
        // given
        val outputFilePath = "test.cc.json"
        val outputFilePathCompressed = "test.cc.json.gz"
        val outputFile = File(outputFilePathCompressed)
        outputFile.deleteOnExit()
        val mockStream = mockk<OutputStream>()

        // when
        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, mockStream, true)

        // then
        assertTrue { outputFile.exists() }
        verify { mockStream wasNot called }
    }

    @Test
    fun `serializeToFileOrStream should create a json file`() {
        // given
        val outputFilePath = "test.cc.json"
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()
        val mockStream = mockk<OutputStream>()

        // when
        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, mockStream, false)

        // then
        assertTrue { outputFile.exists() }
        verify { mockStream wasNot called }
    }

    @Test
    fun `serializeToFileOrStream should write to stream`() {
        // given
        val stream = ByteArrayOutputStream()

        // when
        ProjectSerializer.serializeToFileOrStream(project, "", stream, true)
        val result = stream.toString("UTF-8")

        // then
        assertTrue { result.startsWith("{") }
    }

    @Test
    fun `file should log the correct absolute path of the output file`() {
        // given
        val outputFilePath = "src/test/resources/output.csv"
        val outputFile = File(outputFilePath)
        val absoluteOutputFilePath = outputFile.absolutePath
        outputFile.deleteOnExit()
        val mockStream = mockk<OutputStream>()
        System.setOut(PrintStream(outContent))

        // when
        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, mockStream, false)

        // then
        Assertions.assertThat(outContent.toString().contains(absoluteOutputFilePath)).isTrue()

        // clean up
        System.setOut(originalOut)
    }
}
