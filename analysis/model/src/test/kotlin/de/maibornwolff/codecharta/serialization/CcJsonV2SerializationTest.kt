package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

class CcJsonV2SerializationTest {
    private fun sampleProject(): Project {
        val appNode = Node("App.kt", NodeType.File, mapOf("rloc" to 120.0, "mcc" to 8.0), "", setOf(), checksum = "abc123")
        val otherNode = Node("Other.kt", NodeType.File, mapOf("rloc" to 30.0), "", setOf(), checksum = "def456")
        val srcNode = Node("src", NodeType.Folder, emptyMap(), "", setOf(appNode, otherNode))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcNode))
        val edges = listOf(Edge("/root/src/App.kt", "/root/src/Other.kt", mapOf("pairingRate" to 42.0)))
        val attributeTypes =
            mapOf(
                "nodes" to mutableMapOf("rloc" to AttributeType.ABSOLUTE),
                "edges" to mutableMapOf("pairingRate" to AttributeType.RELATIVE)
            )
        val attributeDescriptors = mapOf("rloc" to AttributeDescriptor(title = "Real Lines of Code", direction = 1))
        return Project("my-project", listOf(root), Project.API_VERSION, edges, attributeTypes, attributeDescriptors)
    }

    /**
     * The 1.5 `data` payload (nodes, edges, types, descriptors, blacklist) with the format tag
     * removed, so structural equality ignores the version and the derived wrapper checksum.
     */
    private fun semantic15(project: Project): String {
        val data = JsonParser
            .parseString(
                ProjectSerializer.serializeToString(project, ApiVersion.ONE_FIVE)
            ).asJsonObject
            .getAsJsonObject("data")
        data.remove("apiVersion")
        return data.toString()
    }

    @Test
    fun `should keep 1_5 output wrapped with checksum and data envelope`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.ONE_FIVE)).asJsonObject

        assertTrue(json.has("checksum"))
        assertTrue(json.has("data"))
        assertEquals("1.5", json.getAsJsonObject("data").get("apiVersion").asString)
        assertTrue(json.getAsJsonObject("data").has("nodes"))
    }

    @Test
    fun `should emit 2_0 with meta files and lenses and no outer wrapper`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)).asJsonObject

        assertFalse(json.has("data"))
        assertEquals("2.0", json.getAsJsonObject("meta").get("apiVersion").asString)
        assertTrue(json.getAsJsonObject("meta").has("checksum"))
        assertTrue(json.has("files"))
        assertTrue(json.getAsJsonObject("lenses").has("metrics"))
        assertTrue(json.getAsJsonObject("lenses").has("dependency"))
        assertTrue(json.getAsJsonObject("lenses").has("domain"))
        assertTrue(json.getAsJsonObject("lenses").has("security"))
    }

    @Test
    fun `should be semantically unchanged after a 2_0 round-trip`() {
        val original = sampleProject()

        val viaV2 = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(original, ApiVersion.TWO_ZERO))

        // Equal as 1.5 except for the format tag (a project read from 2.0 legitimately reports 2.0).
        assertEquals(semantic15(original), semantic15(viaV2))
    }

    @Test
    fun `should round-trip 2_0 idempotently`() {
        val onceThrough = ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)
        val twiceThrough = ProjectSerializer.serializeToString(ProjectDeserializer.deserializeProject(onceThrough), ApiVersion.TWO_ZERO)

        assertEquals(onceThrough, twiceThrough)
    }

    @Test
    fun `should key metrics by the same id the file node carries`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)).asJsonObject

        val appId = NodeId.fromSegments(listOf("src", "App.kt"))
        val attributes = json.getAsJsonObject("lenses").getAsJsonObject("metrics").getAsJsonObject("attributes")
        assertTrue(attributes.has(appId))
        assertEquals(120.0, attributes.getAsJsonObject(appId).get("rloc").asDouble)
    }

    @Test
    fun `should reference edge endpoints by node id`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)).asJsonObject

        val edge = json
            .getAsJsonObject("lenses")
            .getAsJsonObject("dependency")
            .getAsJsonArray("edges")
            .first()
            .asJsonObject
        assertEquals(NodeId.fromSegments(listOf("src", "App.kt")), edge.get("fromId").asString)
        assertEquals(NodeId.fromSegments(listOf("src", "Other.kt")), edge.get("toId").asString)
    }

    @Test
    fun `should auto-detect and read both 1_5 and 2_0 input`() {
        val original = sampleProject()

        val from15 = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(original, ApiVersion.ONE_FIVE))
        val from20 = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(original, ApiVersion.TWO_ZERO))

        assertEquals("1.5", from15.apiVersion)
        assertEquals("2.0", from20.apiVersion)
        assertEquals(semantic15(from15), semantic15(from20))
    }

    @Test
    fun `should read gzip-compressed 2_0 files via magic header sniffing`() {
        val tempFile = File.createTempFile("ccjson2", ".json.gz")
        tempFile.deleteOnExit()
        FileOutputStream(tempFile).use { out ->
            ProjectSerializer.serializeProject(
                sampleProject(),
                out,
                compress = true,
                isOutputFileSpecified = true,
                apiVersion = ApiVersion.TWO_ZERO
            )
        }

        val readBack = FileInputStream(tempFile).use { ProjectDeserializer.deserializeProject(it) }

        assertEquals("2.0", readBack.apiVersion)
        assertEquals(semantic15(sampleProject()), semantic15(readBack))
    }

    @Test
    fun `should extract a piped 2_0 project from a noisy stream`() {
        val syncFlag = de.maibornwolff.codecharta.util.CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG
        val pipedPayload = syncFlag + "someConsoleNoise\n" + ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)

        val readBack = ProjectDeserializer.deserializeProject(ByteArrayInputStream(pipedPayload.toByteArray()))

        assertEquals("2.0", readBack?.apiVersion)
    }

    @Test
    fun `should preserve unknown lenses verbatim through a full domain round-trip`() {
        val with20 = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)).asJsonObject
        with20.getAsJsonObject("lenses").add("experimental", JsonParser.parseString("""{"foo":"bar"}"""))

        val domain = ProjectDeserializer.deserializeProject(with20.toString())
        val reSerialized = JsonParser.parseString(ProjectSerializer.serializeToString(domain, ApiVersion.TWO_ZERO)).asJsonObject

        assertEquals("bar", reSerialized.getAsJsonObject("lenses").getAsJsonObject("experimental").get("foo").asString)
    }

    @Test
    fun `should preserve unknown lenses verbatim through a DTO round-trip`() {
        val with20 = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)).asJsonObject
        with20.getAsJsonObject("lenses").add("experimental", JsonParser.parseString("""{"foo":"bar"}"""))

        val dto = CcJsonV2Gson.gson.fromJson(with20, CcJsonV2::class.java)
        val reSerialized = JsonParser.parseString(CcJsonV2Gson.gson.toJson(dto)).asJsonObject

        assertTrue(reSerialized.getAsJsonObject("lenses").has("experimental"))
        assertEquals("bar", reSerialized.getAsJsonObject("lenses").getAsJsonObject("experimental").get("foo").asString)
    }

    @Test
    fun `should round-trip serialize via output stream for both versions`() {
        listOf(ApiVersion.ONE_FIVE, ApiVersion.TWO_ZERO).forEach { version ->
            val out = ByteArrayOutputStream()
            ProjectSerializer.serializeProject(sampleProject(), out, compress = false, isOutputFileSpecified = false, apiVersion = version)

            val readBack = ProjectDeserializer.deserializeProject(out.toString())
            assertEquals(version.versionString, readBack.apiVersion)
        }
    }
}
