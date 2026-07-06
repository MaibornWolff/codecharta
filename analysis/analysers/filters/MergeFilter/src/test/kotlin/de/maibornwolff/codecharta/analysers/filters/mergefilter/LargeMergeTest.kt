package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MetricsLens
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class LargeMergeTest {
    private fun rootProject(lenses: LensSet = LensSet()): Project = Project(
        projectName = "p",
        nodes = listOf(
            Node("root", NodeType.Folder, children = setOf(Node("file.kt", NodeType.File, attributes = mapOf("rloc" to 1))))
        ),
        apiVersion = "2.0",
        lenses = lenses
    )

    @Test
    fun `should wrap nodes under the prefix folder and re-path edges while keeping node attributes`() {
        // Arrange
        val project = rootProject(
            lenses = LensSet(dependency = DependencyLens(edges = listOf(Edge("/root/file.kt", "/root/file.kt"))))
        )

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        val folder = wrapped.rootNode.children.single()
        assertEquals("alpha", folder.name)
        assertEquals(mapOf("rloc" to 1), folder.children.single().attributes)
        assertEquals(
            "/root/alpha/file.kt",
            wrapped.lenses.dependency.edges
                .single()
                .fromNodeName
        )
    }

    @Test
    fun `should preserve empty reserved opaque slots when wrapping`() {
        // Arrange
        val project = rootProject(lenses = LensSet(opaqueLenses = mapOf("domain" to JsonParser.parseString("{}"))))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        assertEquals(JsonParser.parseString("{}"), wrapped.lenses.opaqueLenses["domain"])
    }

    @Test
    fun `should fail loudly when a data-bearing opaque lens cannot be re-pathed`() {
        // Arrange
        val project = rootProject(
            lenses = LensSet(opaqueLenses = mapOf("domain" to JsonParser.parseString("""{"nodeId":"/root/file.kt"}""")))
        )

        // Act & Assert
        assertFailsWith(IllegalArgumentException::class) {
            LargeMerge.wrapProjectInFolder(project, "alpha")
        }
    }

    @Test
    fun `should fail loudly when metrics clusters cannot be re-pathed`() {
        // Arrange
        val project = rootProject(
            lenses = LensSet(metrics = MetricsLens(clusters = listOf(JsonParser.parseString("""{"nodeId":"/root/file.kt"}"""))))
        )

        // Act & Assert
        assertFailsWith(IllegalArgumentException::class) {
            LargeMerge.wrapProjectInFolder(project, "alpha")
        }
    }
}
