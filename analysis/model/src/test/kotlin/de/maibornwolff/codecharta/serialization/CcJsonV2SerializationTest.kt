package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.BlacklistType
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MetricsLens
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import de.maibornwolff.codecharta.util.CodeChartaConstants
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
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
        val lenses = LensSet.fromLegacy(edges, attributeTypes, attributeDescriptors)
        return Project("my-project", listOf(root), Project.API_VERSION, lenses)
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
        // Empty reserved lenses are no longer emitted; they appear only when the source carries them.
        assertFalse(json.getAsJsonObject("lenses").has("domain"))
        assertFalse(json.getAsJsonObject("lenses").has("security"))
    }

    @Test
    fun `should preserve a reserved domain lens verbatim through a 2_0 round-trip`() {
        // Arrange: a project carrying a non-empty domain lens.
        val domainLens = JsonParser.parseString("""{"team":"core","score":7}""")
        val project =
            Project("p", listOf(Node("root", NodeType.Folder)), Project.API_VERSION, LensSet(opaqueLenses = mapOf("domain" to domainLens)))

        // Act
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO)).asJsonObject
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO))

        // Assert: the domain lens is emitted verbatim and survives the round-trip with value equality.
        assertEquals("core", json.getAsJsonObject("lenses").getAsJsonObject("domain").get("team").asString)
        assertEquals(domainLens, roundTripped.lenses.domain)
    }

    @Test
    fun `should round-trip non-numeric clusters json verbatim`() {
        // Arrange: a metrics lens carrying a raw-JSON clusters entry.
        val cluster = JsonParser.parseString("""{"id":1,"label":"core"}""")
        val project =
            Project(
                "p",
                listOf(Node("root", NodeType.Folder)),
                Project.API_VERSION,
                LensSet(metrics = MetricsLens(clusters = listOf(cluster)))
            )

        // Act
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO))

        // Assert: the cluster JSON survives verbatim with well-defined equality.
        assertEquals(listOf(cluster), roundTripped.lenses.metrics.clusters)
    }

    @Test
    fun `should be semantically unchanged after a 2_0 round-trip`() {
        val original = sampleProject()

        val viaV2 = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(original, ApiVersion.TWO_ZERO))

        // Equal as 1.5 except for the format tag (a project read from 2.0 legitimately reports 2.0).
        assertEquals(semantic15(original), semantic15(viaV2))
    }

    @Test
    fun `should lift non-numeric and folder-aggregated metrics into the metrics lens by id`() {
        // Arrange: a file with a non-numeric authors list (GitLog/SVN) and a folder carrying
        // aggregated metrics (NodeMaxAttributeMerger / EdgeFilter write onto folders).
        val appNode =
            Node("App.kt", NodeType.File, mapOf("commits" to 5.0, "authors" to listOf("alice", "bob")), "", setOf(), checksum = "h1")
        val srcNode = Node("src", NodeType.Folder, mapOf("commits" to 5.0), "", setOf(appNode))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcNode))
        val project = Project("p", listOf(root), Project.API_VERSION, lenses = LensSet())

        // Act
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO)).asJsonObject
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO))

        // Assert: both the leaf authors list and the folder metric are keyed by their node id.
        val attributes = json.getAsJsonObject("lenses").getAsJsonObject("metrics").getAsJsonObject("attributes")
        val appId = NodeId.fromSegments(listOf("src", "App.kt"))
        val srcId = NodeId.fromSegments(listOf("src"))
        assertTrue(attributes.getAsJsonObject(appId).getAsJsonArray("authors").size() == 2)
        assertTrue(attributes.getAsJsonObject(srcId).has("commits"))
        assertEquals(semantic15(project), semantic15(roundTripped))
    }

    @Test
    fun `should throw when two tree positions collide on the same node id`() {
        // Arrange: a folder and a synthetic '.' child both carry attributes and canonicalize to "/src".
        val dotChild = Node(".", NodeType.File, mapOf("x" to 1.0), "", setOf(), checksum = "c1")
        val srcNode = Node("src", NodeType.Folder, mapOf("y" to 2.0), "", setOf(dotChild))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcNode))
        val project = Project("p", listOf(root), Project.API_VERSION, LensSet())

        // Act + Assert: the colliding ids fail loud instead of silently overwriting metrics.
        assertThrows<IllegalArgumentException> { ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO) }
    }

    @Test
    fun `should drop the blacklist from the 2_0 wire but keep it in 1_5`() {
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(Node("App.kt", NodeType.File)))
        val blacklist =
            listOf(BlacklistItem("/root/App.kt", BlacklistType.EXCLUDE))
        val project = Project("p", listOf(root), Project.API_VERSION, blacklist = blacklist)

        val v2 = ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO)
        val v1 = ProjectSerializer.serializeToString(project, ApiVersion.ONE_FIVE)

        assertFalse(v2.contains("blacklist"))
        assertTrue(v1.contains("blacklist"))
        // A project read back from 2.0 carries an empty blacklist, so analysis consumers never choke.
        assertTrue(ProjectDeserializer.deserializeProject(v2).blacklist.isEmpty())
    }

    @Test
    fun `should preserve meta commitHash through a 2_0 round-trip`() {
        val project =
            Project("p", listOf(Node("root", NodeType.Folder)), "2.0", LensSet(), commitHash = "a1b2c3d")

        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project, ApiVersion.TWO_ZERO))

        assertEquals("a1b2c3d", roundTripped.commitHash)
    }

    @Test
    fun `should not throw an opaque ClassCastException when meta is not an object`() {
        // Malformed input still fails, but format detection no longer casts a non-object meta and
        // throws a ClassCastException; it degrades to a clearer parse error.
        val malformed = """{"meta":"oops","files":[{"id":"x","name":"root","type":"Folder"}],"lenses":{}}"""

        val thrown = runCatching { ProjectDeserializer.deserializeProject(malformed) }.exceptionOrNull()

        assertTrue(thrown !is ClassCastException)
    }

    @Test
    fun `should route edge attribute descriptors into the dependency lens of 2_0 output`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject(), ApiVersion.TWO_ZERO)).asJsonObject

        // sampleProject has a node descriptor (rloc); ensure node descriptors stay in the metrics lens
        // and the dependency lens descriptor map exists (empty here, since rloc is a node metric).
        val lenses = json.getAsJsonObject("lenses")
        assertTrue(lenses.getAsJsonObject("metrics").getAsJsonObject("attributeDescriptors").has("rloc"))
        assertFalse(lenses.getAsJsonObject("dependency").getAsJsonObject("attributeDescriptors").has("rloc"))
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
        val syncFlag = CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG
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
