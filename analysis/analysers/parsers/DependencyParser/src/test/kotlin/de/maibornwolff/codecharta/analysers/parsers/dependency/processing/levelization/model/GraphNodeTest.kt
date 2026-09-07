package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class GraphNodeTest {
    @Test
    fun `should return a single root unchanged instead of wrapping it`() {
        // Arrange
        val root = GraphNode(id = "com.example", parent = null, children = emptyList())

        // Act
        val (nodes, unifiedRoot) = GraphNode.wrapInVirtualRootIfNeeded(listOf(root))

        // Assert
        assertThat(nodes).containsExactly(root)
        assertThat(unifiedRoot).isEqualTo(root)
    }

    @Test
    fun `should wrap several roots in one virtual root so they share an ancestor`() {
        // Arrange
        val first = GraphNode(id = "com.first", parent = null, children = emptyList())
        val second = GraphNode(id = "com.second", parent = null, children = emptyList())

        // Act
        val (nodes, virtualRoot) = GraphNode.wrapInVirtualRootIfNeeded(listOf(first, second))

        // Assert
        assertThat(virtualRoot.parent).isNull()
        assertThat(virtualRoot.children).hasSize(2)
        assertThat(nodes).allMatch { it.parent == virtualRoot.id }
    }

    @Test
    fun `should refuse to wrap an empty list`() {
        // Act & Assert
        assertThatThrownBy { GraphNode.wrapInVirtualRootIfNeeded(emptyList()) }
            .isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `should refuse to wrap a node that already has a parent`() {
        // Arrange
        val child = GraphNode(id = "child", parent = "some.parent", children = emptyList())
        val root = GraphNode(id = "root", parent = null, children = emptyList())

        // Act & Assert
        assertThatThrownBy { GraphNode.wrapInVirtualRootIfNeeded(listOf(child, root)) }
            .isInstanceOf(IllegalStateException::class.java)
    }
}
