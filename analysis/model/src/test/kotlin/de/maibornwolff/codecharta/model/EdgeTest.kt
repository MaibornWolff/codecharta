package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

internal class EdgeTest {
    private val nodeA = "nodeA"
    private val nodeB = "nodeB"
    private val attributes = mapOf("testAttribute" to 0, "anotherAttribute" to "42")
    private val edgeFull = Edge(nodeA, nodeB)
    private val edgeEqualAttributes = Edge(nodeA, nodeB, attributes)

    @Test
    fun `should put all attributes in toString`() {
        assertThat(edgeEqualAttributes.toString()).contains("nodeA", "nodeB", "testAttribute=0", "anotherAttribute=42")
    }

    @Test
    fun `should identify equals correctly`() {
        val edgeFullEqual = Edge(nodeA, nodeB)
        val edgeReference = edgeFull
        val edgeNull: Edge? = null
        val edgeNotEqual = Edge(nodeA, "node3")
        val edgeEqualButAttributes = Edge(nodeA, nodeB, attributes)
        val node = Node("aNode")

        assertEquals(edgeFull, edgeFullEqual)
        assertEquals(edgeFull, edgeReference)
        assertNotEquals(edgeFull, edgeNull)
        assertNotEquals(edgeFull, null)
        assertNotEquals(edgeFull, edgeNotEqual)
        assertNotEquals(edgeFull, node)
        assertEquals(edgeEqualAttributes, edgeEqualButAttributes)
        assertNotEquals(edgeFull, edgeEqualButAttributes)
        assertEquals(edgeEqualButAttributes.hashCode(), edgeEqualAttributes.hashCode())
    }

    @Test
    fun `should treat edges differing only in a graph flag as unequal`() {
        val regular = Edge(nodeA, nodeB, attributes)
        val cyclic = Edge(nodeA, nodeB, attributes, isCyclic = true)
        val upwards = Edge(nodeA, nodeB, attributes, isPointingUpwards = true)

        assertNotEquals(regular, cyclic)
        assertNotEquals(regular, upwards)
        assertNotEquals(cyclic, upwards)
    }

    @Test
    fun `should carry the graph flags onto the new endpoints when re-pathing an edge`() {
        val edge = Edge(nodeA, nodeB, attributes, isCyclic = true, isPointingUpwards = true)

        val rePathed = edge.withEndpoints("/root/nodeA", "/root/nodeB")

        assertEquals(Edge("/root/nodeA", "/root/nodeB", attributes, isCyclic = true, isPointingUpwards = true), rePathed)
    }
}
