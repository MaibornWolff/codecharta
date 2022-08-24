package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import io.mockk.mockk
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.File
import java.io.FileOutputStream
import kotlin.test.assertTrue

class ProjectSerializerTest : Spek({

    val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    val tempDir = createTempDir()
    val filename = tempDir.absolutePath + "test.cc.json"

    describe("ProjectSerializer") {
        it("should serialize project") {
            val jsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3).reader()
            val expectedJsonString = this.javaClass.classLoader.getResource("example_api_version_1.3.cc.json").readText()
            val testProject = ProjectDeserializer.deserializeProject(jsonReader)

            ProjectSerializer.serializeProject(testProject, FileOutputStream(filename), false)

            val testJsonString = File(filename).readText()

            JSONAssert.assertEquals(testJsonString, expectedJsonString, JSONCompareMode.NON_EXTENSIBLE)
        }
    }

    describe("serializeAsCompressedFile") {
        val project = mockk<Project>()

        it("should create a gz file") {
            ProjectSerializer.serializeAsCompressedFile(project, "test.cc.json")
            assertTrue { File("test.cc.json.gz").exists() }
            File("test.cc.json.gz").delete()
        }
    }
})
