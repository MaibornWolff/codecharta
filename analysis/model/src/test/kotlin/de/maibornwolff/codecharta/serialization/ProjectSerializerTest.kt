package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import io.mockk.called
import io.mockk.mockk
import io.mockk.verify
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.nio.charset.StandardCharsets.UTF_8
import kotlin.io.path.absolute
import kotlin.io.path.createTempDirectory
import kotlin.test.assertTrue

class ProjectSerializerTest : Spek({

    val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    val tempDir = createTempDirectory()
    val filename = tempDir.absolute().toString() + "test.cc.json"

    describe("ProjectSerializer") {
        it("should serialize project") {
            val jsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3)!!.reader()
            val expectedJsonString = this.javaClass.classLoader.getResource("example_api_version_1.3.cc.json")!!.readText()
            val testProject = ProjectDeserializer.deserializeProject(jsonReader)

            ProjectSerializer.serializeProject(testProject, FileOutputStream(filename), false)

            val testJsonString = File(filename).readText()
            System.err.println(testJsonString)
            System.err.println(expectedJsonString)
            JSONAssert.assertEquals(testJsonString, expectedJsonString, JSONCompareMode.NON_EXTENSIBLE)
        }
    }

    describe("serializeToFileOrStream") {
        val project = mockk<Project>()

        it("should create a gz file") {
            val mockStream = mockk<OutputStream>()
            ProjectSerializer.serializeToFileOrStream(project, "test.cc.json", mockStream, true)
            assertTrue { File("test.cc.json.gz").exists() }
            File("test.cc.json.gz").delete()
            verify { mockStream wasNot called }
        }
        it("should create a json file") {
            val mockStream = mockk<OutputStream>()
            ProjectSerializer.serializeToFileOrStream(project, "test.cc.json", mockStream, false)
            assertTrue { File("test.cc.json").exists() }
            File("test.cc.json").delete()
            verify { mockStream wasNot called }
        }
        it("should write to stream") {
            val stream = ByteArrayOutputStream()
            ProjectSerializer.serializeToFileOrStream(project, "", stream, true)
            val result = stream.toString(UTF_8)
            assertTrue { result.startsWith("{") }
        }
    }
})
