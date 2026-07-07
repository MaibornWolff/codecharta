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
import de.maibornwolff.codecharta.serialization.dto.FileDto
import de.maibornwolff.codecharta.serialization.dto.LensesDto
import de.maibornwolff.codecharta.serialization.dto.MetaDto
import de.maibornwolff.codecharta.serialization.dto.MetricsLensDto
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.Logger
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkObject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNotNull
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
     * The canonical 2.0 serialization, used as a structural oracle: two projects with the same data
     * serialize to byte-identical 2.0 (the meta checksum is derived and the version is constant), so
     * equality here means "same project data" regardless of which format it was read from.
     */
    private fun serialized(project: Project): String = ProjectSerializer.serializeToString(project)

    @Test
    fun `should keep the meta checksum byte-stable`() {
        // Characterization guard: meta.checksum is an MD5 over the serialized {files, lenses} body.
        // This pins its exact value so the single-pass DigestOutputStream optimization cannot change
        // the wire definition.
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject

        assertEquals("24d98eb4e93ec5d7ea6a8223928c6437", json.getAsJsonObject("meta").get("checksum").asString)
    }

    @Test
    fun `should emit children in a deterministic order regardless of input sibling order`() {
        // Arrange: the same three attributed leaves under one folder, inserted in opposite sibling orders.
        val zebra = Node("Zebra.kt", NodeType.File, mapOf("rloc" to 1.0), "", setOf(), checksum = "z")
        val apple = Node("Apple.kt", NodeType.File, mapOf("rloc" to 2.0), "", setOf(), checksum = "a")
        val mango = Node("mango.kt", NodeType.File, mapOf("rloc" to 3.0), "", setOf(), checksum = "m")
        val projectA =
            Project("p", listOf(Node("root", NodeType.Folder, emptyMap(), "", setOf(zebra, apple, mango))), Project.API_VERSION, LensSet())
        val projectB =
            Project("p", listOf(Node("root", NodeType.Folder, emptyMap(), "", setOf(mango, apple, zebra))), Project.API_VERSION, LensSet())

        // Act
        val a = ProjectSerializer.serializeToString(projectA)
        val b = ProjectSerializer.serializeToString(projectB)

        // Assert: byte-identical output (hence identical meta.checksum) regardless of input order ...
        assertEquals(a, b)
        // ... with children sorted by NFC name (uppercase before lowercase pins the comparator).
        val names =
            JsonParser
                .parseString(a)
                .asJsonObject
                .getAsJsonArray("files")[0]
                .asJsonObject
                .getAsJsonArray("children")
                .map { it.asJsonObject.get("name").asString }
        assertEquals(listOf("Apple.kt", "Zebra.kt", "mango.kt"), names)
    }

    @Test
    fun `should preserve non-ASCII node names as UTF-8 through the single-pass output stream`() {
        val file = Node("Größe.kt", NodeType.File, mapOf("rloc" to 1.0), "", setOf(), checksum = "u1")
        val folder = Node("Prüfungsordner", NodeType.Folder, emptyMap(), "", setOf(file))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(folder))
        val project = Project("Straße", listOf(root), Project.API_VERSION, LensSet())
        val out = ByteArrayOutputStream()

        ProjectSerializer.serializeProject(project, out, compress = false)

        val bytes = out.toByteArray()
        // The umlaut is written as its UTF-8 byte sequence (ü = 0xC3 0xBC), not a default-charset mangle.
        assertTrue(containsSubsequence(bytes, byteArrayOf(0xC3.toByte(), 0xBC.toByte())))
        // Decoding as UTF-8 and reading the file back preserves the German names exactly.
        val readBack = ProjectDeserializer.deserializeProject(String(bytes, Charsets.UTF_8))
        val readFolder = readBack.rootNode.children.single()
        assertEquals("Prüfungsordner", readFolder.name)
        assertEquals("Größe.kt", readFolder.children.single().name)
        // The single-pass stream and the DTO path agree byte-for-byte on the non-ASCII content too.
        assertEquals(ProjectSerializer.serializeToString(project), String(bytes, Charsets.UTF_8))
    }

    private fun containsSubsequence(haystack: ByteArray, needle: ByteArray): Boolean {
        for (i in 0..haystack.size - needle.size) {
            if ((needle.indices).all { haystack[i + it] == needle[it] }) return true
        }
        return false
    }

    @Test
    fun `should write byte-identical output through the single-pass stream and the DTO path`() {
        // The hot OutputStream path splices reused body bytes after meta; assert those bytes match the
        // canonical DTO serialization exactly (framing, key order, and checksum all identical).
        val project = sampleProject()
        val out = ByteArrayOutputStream()

        ProjectSerializer.serializeProject(project, out, compress = false)

        assertEquals(ProjectSerializer.serializeToString(project), out.toString("UTF-8"))
    }

    @Test
    fun `should emit 2_0 with meta files and lenses and no outer wrapper`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject

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
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(project)).asJsonObject
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

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
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

        // Assert: the cluster JSON survives verbatim with well-defined equality.
        assertEquals(listOf(cluster), roundTripped.lenses.metrics.clusters)
    }

    @Test
    fun `should be semantically unchanged after a 2_0 round-trip`() {
        val original = sampleProject()

        val viaV2 = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(original))

        // The data is identical after a 2.0 round-trip.
        assertEquals(serialized(original), serialized(viaV2))
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
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(project)).asJsonObject
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

        // Assert: both the leaf authors list and the folder metric are keyed by their node id.
        val attributes = json.getAsJsonObject("lenses").getAsJsonObject("metrics").getAsJsonObject("attributes")
        val appId = NodeId.fromSegments(listOf("src", "App.kt"))
        val srcId = NodeId.fromSegments(listOf("src"), NodeType.Folder)
        assertTrue(attributes.getAsJsonObject(appId).getAsJsonArray("authors").size() == 2)
        assertTrue(attributes.getAsJsonObject(srcId).has("commits"))
        assertEquals(serialized(project), serialized(roundTripped))
    }

    @Test
    fun `should throw when two tree positions collide on the same node id`() {
        // Arrange: a folder and a synthetic '.' folder both carry attributes and canonicalize to "/src".
        val dotChild = Node(".", NodeType.Folder, mapOf("x" to 1.0), "", setOf(), checksum = "c1")
        val srcNode = Node("src", NodeType.Folder, mapOf("y" to 2.0), "", setOf(dotChild))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcNode))
        val project = Project("p", listOf(root), Project.API_VERSION, LensSet())

        // Act + Assert: the colliding ids fail loud instead of silently overwriting metrics.
        assertThrows<IllegalArgumentException> { ProjectSerializer.serializeToString(project) }
    }

    @Test
    fun `should throw on an attribute-less node id collision`() {
        // Arrange: a synthetic '.' folder with NO attributes still canonicalizes to its parent's "/src".
        // Before the unconditional guard this collision was silent (the guard only saw attributed nodes).
        val dotChild = Node(".", NodeType.Folder, emptyMap(), "", setOf())
        val srcNode = Node("src", NodeType.Folder, emptyMap(), "", setOf(dotChild))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcNode))
        val project = Project("p", listOf(root), Project.API_VERSION, LensSet())

        assertThrows<IllegalArgumentException> { ProjectSerializer.serializeToString(project) }
    }

    @Test
    fun `should give a File and a Folder with the same name distinct ids instead of colliding`() {
        // Arrange: a legal 1.x shape - a File and a Folder named "foo" under one parent (viz keys on path|type).
        val fileFoo = Node("foo", NodeType.File, mapOf("rloc" to 1.0), "", setOf())
        val folderFoo = Node("foo", NodeType.Folder, mapOf("rloc" to 2.0), "", setOf())
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(fileFoo, folderFoo))
        val project = Project("p", listOf(root), Project.API_VERSION, LensSet())

        // Act: type is part of the id, so the two nodes no longer collide and serialization succeeds.
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(project)).asJsonObject

        // Assert: both ids are present and distinct in the metrics lens.
        val fileId = NodeId.fromSegments(listOf("foo"), NodeType.File)
        val folderId = NodeId.fromSegments(listOf("foo"), NodeType.Folder)
        val attributes = json.getAsJsonObject("lenses").getAsJsonObject("metrics").getAsJsonObject("attributes")
        assertNotEquals(fileId, folderId)
        assertEquals(1.0, attributes.getAsJsonObject(fileId).get("rloc").asDouble)
        assertEquals(2.0, attributes.getAsJsonObject(folderId).get("rloc").asDouble)
    }

    @Test
    fun `should drop the blacklist from the 2_0 wire`() {
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(Node("App.kt", NodeType.File)))
        val blacklist = listOf(BlacklistItem("/root/App.kt", BlacklistType.EXCLUDE))
        val project = Project("p", listOf(root), Project.API_VERSION, blacklist = blacklist)

        val v2 = ProjectSerializer.serializeToString(project)

        assertFalse(v2.contains("blacklist"))
        // A project read back from 2.0 carries an empty blacklist, so analysis consumers never choke.
        assertTrue(ProjectDeserializer.deserializeProject(v2).blacklist.isEmpty())
    }

    @Test
    fun `should preserve meta commitHash through a 2_0 round-trip`() {
        val project =
            Project("p", listOf(Node("root", NodeType.Folder)), "2.0", LensSet(), commitHash = "a1b2c3d")

        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

        assertEquals("a1b2c3d", roundTripped.commitHash)
    }

    @Test
    fun `should not throw an opaque ClassCastException when meta is not an object`() {
        // Malformed input still fails, but format detection no longer casts a non-object meta and
        // throws a ClassCastException; it degrades to a clearer parse error.
        val malformed = """{"meta":"oops","files":[{"id":"x","name":"root","type":"Folder"}],"lenses":{}}"""

        val thrown = runCatching { ProjectDeserializer.deserializeProject(malformed) }.exceptionOrNull()

        assertNotNull(thrown)
        assertTrue(thrown !is ClassCastException)
    }

    @Test
    fun `should throw a clear error for an unsupported future cc_json major`() {
        val future = """{"meta":{"apiVersion":"3.0"},"files":[],"lenses":{}}"""

        val thrown = assertThrows<Exception> { ProjectDeserializer.deserializeProject(future) }

        assertTrue(thrown.message!!.contains("unsupported cc.json version 3"))
    }

    @Test
    fun `should throw a clear error when the top-level json is not an object`() {
        listOf(""""hello"""", "[1,2,3]").forEach { malformed ->
            val thrown = assertThrows<Exception> { ProjectDeserializer.deserializeProject(malformed) }
            assertTrue(thrown.message!!.contains("not a valid cc.json document"))
        }
    }

    @Test
    fun `should route edge attribute descriptors into the dependency lens of 2_0 output`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject

        // sampleProject has a node descriptor (rloc); ensure node descriptors stay in the metrics lens
        // and the dependency lens descriptor map exists (empty here, since rloc is a node metric).
        val lenses = json.getAsJsonObject("lenses")
        assertTrue(lenses.getAsJsonObject("metrics").getAsJsonObject("attributeDescriptors").has("rloc"))
        assertFalse(lenses.getAsJsonObject("dependency").getAsJsonObject("attributeDescriptors").has("rloc"))
    }

    @Test
    fun `should round-trip 2_0 idempotently`() {
        val onceThrough = ProjectSerializer.serializeToString(sampleProject())
        val twiceThrough = ProjectSerializer.serializeToString(ProjectDeserializer.deserializeProject(onceThrough))

        assertEquals(onceThrough, twiceThrough)
    }

    @Test
    fun `should key metrics by the same id the file node carries`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject

        val appId = NodeId.fromSegments(listOf("src", "App.kt"))
        val attributes = json.getAsJsonObject("lenses").getAsJsonObject("metrics").getAsJsonObject("attributes")
        assertTrue(attributes.has(appId))
        assertEquals(120.0, attributes.getAsJsonObject(appId).get("rloc").asDouble)
    }

    @Test
    fun `should reference edge endpoints by node id`() {
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject

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
    fun `should keep the edges of an edge-only project after a 2_0 round-trip`() {
        // Arrange: a bare-root project carrying only edges - the shape CodeMaatImporter emits.
        val root = Node("root", NodeType.Folder)
        val edges = listOf(Edge("/root/src/A.kt", "/root/src/B.kt", mapOf("coupling" to 5.0)))
        val attributeTypes = mapOf("edges" to mutableMapOf("coupling" to AttributeType.ABSOLUTE))
        val project = Project("edge-only", listOf(root), Project.API_VERSION, LensSet.fromLegacy(edges, attributeTypes, emptyMap()))

        // Act
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

        // Assert: the edge survives and its endpoints resolve back to their original paths.
        assertEquals(1, roundTripped.sizeOfEdges())
        val edge = roundTripped.lenses.dependency.edges.first()
        assertEquals("/root/src/A.kt", edge.fromNodeName)
        assertEquals("/root/src/B.kt", edge.toNodeName)
    }

    @Test
    fun `should pick an edge endpoint type independent of sibling order when a File and Folder share the path`() {
        // A File and Folder both named "foo" under root share the path "/foo"; an edge targets it. The
        // endpoint id must not depend on which sibling is iterated last, so it is pinned to File (lowest
        // NodeType ordinal). Both orderings must emit the same, File-typed, edge fromId.
        fun edgeFromId(children: Set<Node>): String {
            val root = Node("root", NodeType.Folder, emptyMap(), "", children)
            val edges = listOf(Edge("/root/foo", "/root/bar", mapOf("coupling" to 1.0)))
            val project = Project("p", listOf(root), Project.API_VERSION, LensSet.fromLegacy(edges, emptyMap(), emptyMap()))
            val json = JsonParser.parseString(ProjectSerializer.serializeToString(project)).asJsonObject
            return json
                .getAsJsonObject("lenses")
                .getAsJsonObject("dependency")
                .getAsJsonArray("edges")
                .first()
                .asJsonObject
                .get("fromId")
                .asString
        }
        val fileFoo = Node("foo", NodeType.File)
        val folderFoo = Node("foo", NodeType.Folder)

        val expected = NodeId.fromSegments(listOf("foo"), NodeType.File)
        assertEquals(expected, edgeFromId(setOf(fileFoo, folderFoo)))
        assertEquals(expected, edgeFromId(setOf(folderFoo, fileFoo)))
    }

    @Test
    fun `should resolve an edge whose endpoint is a Folder after a 2_0 round-trip`() {
        // Arrange: an edge targets a Folder node (not a leaf File). The writer must hash the endpoint
        // with the folder's real type (resolved from the tree) or the endpoint id would be sha(File/src),
        // never match the Folder node's sha(Folder/src), and the edge would silently drop on read.
        val leaf = Node("App.kt", NodeType.File)
        val srcFolder = Node("src", NodeType.Folder, emptyMap(), "", setOf(leaf))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcFolder))
        val edges = listOf(Edge("/root/src", "/root/src/App.kt", mapOf("coupling" to 3.0)))
        val project = Project("p", listOf(root), Project.API_VERSION, LensSet.fromLegacy(edges, emptyMap(), emptyMap()))

        // Act
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

        // Assert: the folder-targeting edge survives because its endpoint id matched the Folder node's id.
        assertEquals(1, roundTripped.sizeOfEdges())
        val edge = roundTripped.lenses.dependency.edges.first()
        assertEquals("/root/src", edge.fromNodeName)
        assertEquals("/root/src/App.kt", edge.toNodeName)
    }

    @Test
    fun `should keep node names and edge endpoints NFC-consistent through a 2_0 round-trip`() {
        // Arrange: a leaf whose name is spelled NFD (as a macOS filesystem walker emits) with an edge
        // targeting it. On the wire the node id and the endpoint are NFC; the node name must be NFC too
        // or EdgeFilter's exact-string endpoint matching silently stops aggregating and inserts ghost
        // NFC-named duplicate nodes.
        val nfcName = Char(0x00C4) + "pfel.kt" // precomposed Ä + "pfel.kt"
        val nfdName = "A" + Char(0x0308) + "pfel.kt" // A + combining diaeresis + "pfel.kt"
        val nfdLeaf = Node(nfdName, NodeType.File)
        val otherLeaf = Node("Other.kt", NodeType.File)
        val src = Node("src", NodeType.Folder, emptyMap(), "", setOf(nfdLeaf, otherLeaf))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(src))
        val edges = listOf(Edge("/root/src/$nfdName", "/root/src/Other.kt", mapOf("coupling" to 1.0)))
        val project = Project("nfd", listOf(root), Project.API_VERSION, LensSet.fromLegacy(edges, emptyMap(), emptyMap()))

        // Act
        val roundTripped = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(project))

        // Assert: the node name is NFC (not the original NFD bytes) ...
        val srcFolder = roundTripped.rootNode.children.first()
        val readLeaf = srcFolder.children.first { it.name.endsWith("pfel.kt") }
        assertEquals(nfcName, readLeaf.name)
        assertNotEquals(nfdName, readLeaf.name)
        // ... and the reconstructed edge endpoint is the same NFC path, so EdgeFilter can aggregate.
        val edge = roundTripped.lenses.dependency.edges.first { it.fromNodeName.endsWith("pfel.kt") }
        assertEquals("/root/src/$nfcName", edge.fromNodeName)
    }

    @Test
    fun `should write NFC-normalized node names so a 2_0 round-trip is byte-idempotent`() {
        // Arrange: a leaf spelled NFD. The writer must emit its name NFC (matching the NFC id), or a
        // read (which normalizes the name) followed by a re-write yields different bytes and a drifting
        // meta.checksum.
        val nfcName = Char(0x00C4) + "pfel.kt"
        val nfdName = "A" + Char(0x0308) + "pfel.kt"
        val leaf = Node(nfdName, NodeType.File)
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(leaf))
        val project = Project("nfd", listOf(root))

        // Act
        val serialized = ProjectSerializer.serializeToString(project)

        // Assert: the emitted name is NFC, not the original NFD bytes ...
        val emittedName =
            JsonParser
                .parseString(serialized)
                .asJsonObject
                .getAsJsonArray("files")
                .first()
                .asJsonObject
                .getAsJsonArray("children")
                .first()
                .asJsonObject
                .get("name")
                .asString
        assertEquals(nfcName, emittedName)
        // ... so re-serializing the parsed-back project is byte-identical (stable meta.checksum).
        val reSerialized = ProjectSerializer.serializeToString(ProjectDeserializer.deserializeProject(serialized))
        assertEquals(serialized, reSerialized)
    }

    @Test
    fun `should NFC-normalize a foreign 2_0 file whose node name is NFD on read`() {
        // Arrange: a 2.0 DTO built directly (not via the normalizing writer), as a foreign producer might
        // emit — node name NFD. The reader must normalize it so it agrees with its NFC id and endpoints.
        val nfcName = Char(0x00C4) + "pfel.kt"
        val nfdName = "A" + Char(0x0308) + "pfel.kt"
        val dto =
            CcJsonV2(
                MetaDto("foreign", "2.0", "checksum"),
                listOf(
                    FileDto(
                        id = "id-root",
                        name = "root",
                        type = "Folder",
                        children = listOf(FileDto(id = "id-leaf", name = nfdName, type = "File"))
                    )
                ),
                LensesDto()
            )

        // Act
        val project = CcJsonV2ToProjectMapper.toProject(dto)

        // Assert
        val readLeaf = project.rootNode.children.first()
        assertEquals(nfcName, readLeaf.name)
    }

    @Test
    fun `should materialize edge endpoint file nodes into the 2_0 file tree`() {
        // Arrange
        val root = Node("root", NodeType.Folder)
        val edges = listOf(Edge("/root/src/A.kt", "/root/src/B.kt", mapOf("coupling" to 5.0)))
        val project = Project("edge-only", listOf(root), Project.API_VERSION, LensSet.fromLegacy(edges, emptyMap(), emptyMap()))

        // Act: the file tree now carries nodes whose ids equal the edge's fromId/toId.
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(project)).asJsonObject
        val edge = json
            .getAsJsonObject("lenses")
            .getAsJsonObject("dependency")
            .getAsJsonArray("edges")
            .first()
            .asJsonObject
        val src = json
            .getAsJsonArray("files")
            .first()
            .asJsonObject
            .getAsJsonArray("children")
            .first()
            .asJsonObject
        val childIds = src.getAsJsonArray("children").map { it.asJsonObject.get("id").asString }.toSet()

        // Assert
        assertTrue(childIds.contains(edge.get("fromId").asString))
        assertTrue(childIds.contains(edge.get("toId").asString))
    }

    @Test
    fun `should drop edges whose endpoints do not resolve to a node`() {
        // Arrange: a valid 2.0 document whose single edge references ids absent from the file tree.
        val json = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject
        val edge = json
            .getAsJsonObject("lenses")
            .getAsJsonObject("dependency")
            .getAsJsonArray("edges")
            .first()
            .asJsonObject
        edge.addProperty("fromId", "deadbeefdeadbeef")
        edge.addProperty("toId", "feedfacefeedface")

        // Act
        val project = ProjectDeserializer.deserializeProject(json.toString())

        // Assert: the unresolved edge is dropped instead of leaking a raw hash as a node name.
        assertTrue(project.lenses.dependency.edges.isEmpty())
    }

    @Test
    fun `should warn when a metrics-lens entry has an unresolved node id`() {
        // Arrange: a foreign 2.0 DTO whose metrics lens keys an id absent from the file tree.
        val dto =
            CcJsonV2(
                MetaDto("foreign", "2.0", "checksum"),
                listOf(FileDto(id = "id-root", name = "root", type = "Folder")),
                LensesDto(metrics = MetricsLensDto(attributes = mapOf("dangling-id" to mapOf("rloc" to 1.0))))
            )
        val warnings = mutableListOf<() -> String>()
        mockkObject(Logger)
        try {
            every { Logger.warn(capture(warnings)) } returns Unit

            // Act
            val project = CcJsonV2ToProjectMapper.toProject(dto)

            // Assert: the orphaned metric is dropped and a warning names the unresolved id.
            assertTrue(project.rootNode.attributes.isEmpty())
            assertTrue(warnings.any { it().contains("dangling-id") })
        } finally {
            unmockkObject(Logger)
        }
    }

    @Test
    fun `should read a legacy 1_x file only when legacy reading is allowed`() {
        // Arrange: a real legacy 1.3 file on disk (only `ccsh convert` reads 1.x).
        val legacy = this.javaClass.classLoader.getResource("example_api_version_1.3.cc.json")!!.readText()

        // Assert: a normal read rejects it and points at convert; the convert path (allowLegacy) reads it.
        val rejected = assertThrows<Exception> { ProjectDeserializer.deserializeProject(legacy) }
        assertTrue(rejected.message!!.contains("convert"))

        // Act: read via the legacy-allowed path, then read it back after a 2.0 serialization.
        val from1x = ProjectDeserializer.deserializeProject(legacy, allowLegacy = true)
        val from20 = ProjectDeserializer.deserializeProject(ProjectSerializer.serializeToString(from1x))

        // Assert: the legacy file reports its own 1.x version, the 2.0 re-read reports 2.0, and the data
        // is identical once both render as 2.0 (lossless 1.x read + convert).
        assertEquals("1.3", from1x.apiVersion)
        assertEquals("2.0", from20.apiVersion)
        assertEquals(serialized(from1x), serialized(from20))
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
                isOutputFileSpecified = true
            )
        }

        val readBack = FileInputStream(tempFile).use { ProjectDeserializer.deserializeProject(it) }

        assertEquals("2.0", readBack.apiVersion)
        assertEquals(serialized(sampleProject()), serialized(readBack))
    }

    @Test
    fun `should extract a piped 2_0 project from a noisy stream`() {
        val syncFlag = CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG
        val pipedPayload = syncFlag + "someConsoleNoise\n" + ProjectSerializer.serializeToString(sampleProject())

        val readBack = ProjectDeserializer.deserializeProject(ByteArrayInputStream(pipedPayload.toByteArray()))

        assertEquals("2.0", readBack?.apiVersion)
    }

    @Test
    fun `should preserve unknown lenses verbatim through a full domain round-trip`() {
        val with20 = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject
        with20.getAsJsonObject("lenses").add("experimental", JsonParser.parseString("""{"foo":"bar"}"""))

        val domain = ProjectDeserializer.deserializeProject(with20.toString())
        val reSerialized = JsonParser.parseString(ProjectSerializer.serializeToString(domain)).asJsonObject

        assertEquals("bar", reSerialized.getAsJsonObject("lenses").getAsJsonObject("experimental").get("foo").asString)
    }

    @Test
    fun `should preserve unknown lenses verbatim through a DTO round-trip`() {
        val with20 = JsonParser.parseString(ProjectSerializer.serializeToString(sampleProject())).asJsonObject
        with20.getAsJsonObject("lenses").add("experimental", JsonParser.parseString("""{"foo":"bar"}"""))

        val dto = CcJsonV2Gson.gson.fromJson(with20, CcJsonV2::class.java)
        val reSerialized = JsonParser.parseString(CcJsonV2Gson.gson.toJson(dto)).asJsonObject

        assertTrue(reSerialized.getAsJsonObject("lenses").has("experimental"))
        assertEquals("bar", reSerialized.getAsJsonObject("lenses").getAsJsonObject("experimental").get("foo").asString)
    }

    @Test
    fun `should round-trip serialize via an output stream`() {
        val out = ByteArrayOutputStream()
        ProjectSerializer.serializeProject(sampleProject(), out, compress = false, isOutputFileSpecified = false)

        val readBack = ProjectDeserializer.deserializeProject(out.toString())
        assertEquals("2.0", readBack.apiVersion)
    }
}
