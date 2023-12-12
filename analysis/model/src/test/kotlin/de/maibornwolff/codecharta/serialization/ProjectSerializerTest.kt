package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import io.mockk.called
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import mu.KLogger
import mu.KotlinLogging
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
    private val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    private val tempDir = createTempDirectory()
    private val filename = tempDir.absolute().toString() + "test.cc.json"
    private val project = mockk<Project>()
    private val loggerMock = mockk<KLogger>()
    private val infoMessagesLogged = mutableListOf<String>()
    private val warningMessagesLogged = mutableListOf<String>()

    @BeforeAll
    fun beforeTests() {
        mockkObject(KotlinLogging)
        every { KotlinLogging.logger(any<(() -> Unit)>()) } returns loggerMock
        every { loggerMock.info(capture(infoMessagesLogged)) } returns Unit
        every { loggerMock.warn(capture(warningMessagesLogged)) } returns Unit
    }

    @BeforeEach
    fun beforeTest() {
        infoMessagesLogged.clear()
        warningMessagesLogged.clear()
    }

    @AfterAll
    fun afterTests() {
        unmockkAll()
    }

    @Test
    fun `should correctly serialize the specified project when provided as input`() {
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
        assertTrue { outputFile.exists() }
        verify { mockStream wasNot called }
    }

    @Test
    fun `should create uncompressed json file when output file is specified and compress is false`() {
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
        verify { loggerMock.info(any<String>()) }
    }

    @Test
    fun `should write to stream when outputFilePath is empty`() {
        // given
        val stream = ByteArrayOutputStream()

        // when
        ProjectSerializer.serializeToFileOrStream(project, "", stream, true)
        val result = stream.toString("UTF-8")

        // then
        assertTrue { result.startsWith("{") }
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
        verify { loggerMock.info(any<String>()) }
        Assertions.assertThat(infoMessagesLogged.any { e -> e.endsWith(absoluteOutputFilePath) }).isTrue()
    }

    @Test
    fun `should log warning when compress flag is set but no outputfile is specified`() {
        // given
        val compress = true
        val isOutputFileSpecified = false
        val mockStream = mockk<OutputStream>()
        every { mockStream.write(any<ByteArray>(), any(), any()) } returns Unit
        every { mockStream.flush() } returns Unit

        // when
        ProjectSerializer.serializeProject(project, mockStream, compress, isOutputFileSpecified)

        // then
        Assertions.assertThat(warningMessagesLogged).isNotEmpty()
        verify { loggerMock.warn(any<String>()) }
    }
}
