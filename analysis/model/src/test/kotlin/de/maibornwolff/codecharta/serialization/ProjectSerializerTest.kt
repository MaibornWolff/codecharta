package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import io.mockk.called
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import kotlin.io.path.absolute
import kotlin.io.path.createTempDirectory
import kotlin.test.assertTrue

class ProjectSerializerTest {
    val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    val tempDir = createTempDirectory()
    val filename = tempDir.absolute().toString() + "test.cc.json"
    val project = mockk<Project>()

    @Test
    fun `should serialize project`() {
        val jsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3)!!.reader()
        val expectedJsonString = this.javaClass.classLoader.getResource("example_api_version_1.3.cc.json")!!.readText()
        val testProject = ProjectDeserializer.deserializeProject(jsonReader)

        ProjectSerializer.serializeProject(testProject, FileOutputStream(filename), false)

        val testJsonString = File(filename).readText()
        JSONAssert.assertEquals(testJsonString, expectedJsonString, JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `serializeToFileOrStream should create a gz file`() {
        val mockStream = mockk<OutputStream>()
        ProjectSerializer.serializeToFileOrStream(project, "test.cc.json", mockStream, true)
        assertTrue { File("test.cc.json.gz").exists() }
        File("test.cc.json.gz").delete()
        verify { mockStream wasNot called }
    }

    @Test
    fun `serializeToFileOrStream should create a json file`() {
        val mockStream = mockk<OutputStream>()
        ProjectSerializer.serializeToFileOrStream(project, "test.cc.json", mockStream, false)
        assertTrue { File("test.cc.json").exists() }
        File("test.cc.json").delete()
        verify { mockStream wasNot called }
    }

    @Test
    fun `serializeToFileOrStream should write to stream`() {
        val stream = ByteArrayOutputStream()
        ProjectSerializer.serializeToFileOrStream(project, "", stream, true)
        val result = stream.toString("UTF-8")
        assertTrue { result.startsWith("{") }
    }
}
