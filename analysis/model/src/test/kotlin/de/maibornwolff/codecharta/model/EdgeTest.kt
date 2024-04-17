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
}
