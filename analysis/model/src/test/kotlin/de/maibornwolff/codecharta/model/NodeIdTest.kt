package de.maibornwolff.codecharta.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

class NodeIdTest {
    @Test
    fun `should canonicalize the root node to a single slash`() {
        assertEquals("/", NodeId.canonicalPath(emptyList()))
    }

    @Test
    fun `should join segments with slash and prefix with slash`() {
        assertEquals("/src/App.kt", NodeId.canonicalPath(listOf("src", "App.kt")))
    }

    @Test
    fun `should drop empty segments`() {
        assertEquals("/src/App.kt", NodeId.canonicalPath(listOf("", "src", "", "App.kt")))
    }

    @Test
    fun `should remove dot segments and collapse dot-dot segments`() {
        assertEquals("/src/App.kt", NodeId.canonicalPath(listOf("src", ".", "main", "..", "App.kt")))
    }

    @Test
    fun `should preserve case in the canonical path`() {
        assertNotEquals(NodeId.fromSegments(listOf("src", "App.kt")), NodeId.fromSegments(listOf("src", "app.kt")))
    }

    @Test
    fun `should produce identical id for NFC and NFD spellings of the same name`() {
        val nfcName = Char(0x00C4) + "pfel" // precomposed A-umlaut + "pfel"
        val nfdName = "A" + Char(0x0308) + "pfel" // A + combining diaeresis + "pfel"

        assertNotEquals(nfcName, nfdName) // the raw strings differ before normalization
        assertEquals(NodeId.fromSegments(listOf(nfcName)), NodeId.fromSegments(listOf(nfdName)))
    }

    @Test
    fun `should be deterministic for the same tree position`() {
        assertEquals(NodeId.fromSegments(listOf("src", "App.kt")), NodeId.fromSegments(listOf("src", "App.kt")))
    }

    @Test
    fun `should produce 16 lowercase hex characters`() {
        val id = NodeId.fromSegments(listOf("src", "App.kt"))

        assertEquals(16, id.length)
        assert(id.all { it in "0123456789abcdef" }) { "id must be lowercase hex but was $id" }
    }

    @Test
    fun `should reproduce known sha-256 anchors for cross-tool stability`() {
        assertEquals("8a5edab282632443", NodeId.fromSegments(emptyList()))
        assertEquals("56c9e1c4b5360a5b", NodeId.fromSegments(listOf("src")))
        assertEquals("59b34b4d4f9e0acb", NodeId.fromSegments(listOf("src", "App.kt")))
    }

    @Test
    fun `should strip the synthetic root segment from edge endpoints so they join node ids`() {
        val nodeId = NodeId.fromSegments(listOf("src", "App.kt"))

        assertEquals(nodeId, NodeId.fromEndpoint("/root/src/App.kt"))
    }

    @Test
    fun `should canonicalize edge endpoints with dot and dot-dot the same way as node positions`() {
        val nodeId = NodeId.fromSegments(listOf("src", "App.kt"))

        assertEquals(nodeId, NodeId.fromEndpoint("/root/src/./main/../App.kt"))
    }

    @Test
    fun `should strip the synthetic root even when the endpoint carries leading dot or dot-dot cruft`() {
        val nodeId = NodeId.fromSegments(listOf("src", "App.kt"))

        assertEquals(nodeId, NodeId.fromEndpoint("/./root/src/App.kt"))
        assertEquals(nodeId, NodeId.fromEndpoint("/../root/src/App.kt"))
    }

    @Test
    fun `should round-trip a node position through endpointFromSegments and back`() {
        val segments = listOf("src", "App.kt")

        assertEquals("/root/src/App.kt", NodeId.endpointFromSegments(segments))
        assertEquals(NodeId.fromSegments(segments), NodeId.fromEndpoint(NodeId.endpointFromSegments(segments)))
        assertEquals("/root", NodeId.endpointFromSegments(emptyList()))
    }

    @Test
    fun `should keep a real folder named root that is nested under the synthetic root`() {
        assertEquals(NodeId.fromSegments(listOf("root", "App.kt")), NodeId.fromEndpoint("/root/root/App.kt"))
    }

    @Test
    fun `should give distinct ids to identical file names at different tree positions`() {
        assertNotEquals(NodeId.fromSegments(listOf("a", "README.md")), NodeId.fromSegments(listOf("b", "README.md")))
    }

    @Test
    fun `should give a re-rooted tree different but deterministic ids`() {
        val original = NodeId.fromSegments(listOf("src", "App.kt"))
        val reRooted = NodeId.fromSegments(listOf("project", "src", "App.kt"))

        assertNotEquals(original, reRooted)
        assertEquals(reRooted, NodeId.fromSegments(listOf("project", "src", "App.kt")))
    }
}
