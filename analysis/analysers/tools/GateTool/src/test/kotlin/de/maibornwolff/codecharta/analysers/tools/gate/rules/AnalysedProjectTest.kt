package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.model.DependencyLeaf
import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.DependencyNode
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LeafEdge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AnalysedProjectTest {
    private val project =
        Project(
            "sample",
            listOf(
                Node(
                    "root",
                    NodeType.Folder,
                    children =
                        setOf(
                            Node("Main.kt", NodeType.File, mapOf("rloc" to 12, "language" to "kotlin")),
                            Node("src", NodeType.Folder, children = setOf(Node("Util.kt", NodeType.File, mapOf("rloc" to 3.5)))),
                            Node("empty", NodeType.Folder)
                        )
                )
            ),
            lenses =
                LensSet(
                    dependency =
                        DependencyLens(
                            edges =
                                listOf(
                                    Edge("/root/Main.kt", "/root/src/Util.kt", mapOf("dependencies" to 2), isPointingUpwards = true),
                                    Edge("/root/src/Util.kt", "/root/Main.kt", mapOf("dependencies" to 0), isPointingUpwards = true)
                                ),
                            nodes = mapOf(mainId to DependencyNode(0)),
                            leaves =
                                mapOf(
                                    mainId to mapOf("main" to DependencyLeaf("function")),
                                    utilId to mapOf("Util" to DependencyLeaf("class"))
                                ),
                            leafEdges =
                                listOf(
                                    LeafEdge(mainId, "main", utilId, "Util", isCyclic = true),
                                    LeafEdge(utilId, "Util", mainId, "main", isPointingUpwards = true),
                                    LeafEdge(mainId, "main", utilId, "Undeclared")
                                )
                        )
                )
        )

    @Test
    fun `should list every file with its numeric metrics under its path from the project root`() {
        // Arrange
        val analysedProject = AnalysedProject(project)

        // Act
        val files = analysedProject.files

        // Assert
        assertThat(files).containsExactlyInAnyOrder(
            AnalysedFile("Main.kt", mapOf("rloc" to 12.0)),
            AnalysedFile("src/Util.kt", mapOf("rloc" to 3.5))
        )
    }

    @Test
    fun `should list the dependencies between declared declarations with their files and marks`() {
        // Arrange
        val analysedProject = AnalysedProject(project)

        // Act
        val analysis = analysedProject.dependencyAnalysis!!

        // Assert
        assertThat(analysis.declarationDependencies).containsExactly(
            DeclarationDependency(Declaration("Main.kt", "main"), Declaration("src/Util.kt", "Util"), isCyclic = true),
            DeclarationDependency(Declaration("src/Util.kt", "Util"), Declaration("Main.kt", "main"), isPointingUpwards = true)
        )
    }

    @Test
    fun `should tell which file pairs the dependencies between files mark as upward`() {
        // Arrange
        val analysedProject = AnalysedProject(project)

        // Act
        val upwardOfFilePair = analysedProject.dependencyAnalysis!!.upwardOfFilePair

        // Assert
        assertThat(upwardOfFilePair).isEqualTo(mapOf(("Main.kt" to "src/Util.kt") to true))
    }

    @Test
    fun `should have no dependency analysis when the map carries none`() {
        // Arrange
        val withoutAnalysis =
            Project(
                "omitted",
                listOf(Node("root", NodeType.Folder)),
                lenses = LensSet(dependency = DependencyLens(listOf(Edge("/root/A.kt", "/root/B.kt"))))
            )

        // Act
        val analysis = AnalysedProject(withoutAnalysis).dependencyAnalysis

        // Assert
        assertThat(analysis).isNull()
    }

    @Test
    fun `should leave the dependencies of excluded files out of the dependency analysis`() {
        // Arrange
        val analysis = AnalysedProject(project).dependencyAnalysis!!

        // Act
        val withoutUtil = analysis.withoutFiles { it.startsWith("src/") }

        // Assert
        assertThat(withoutUtil.declarationDependencies).isEmpty()
        assertThat(withoutUtil.upwardOfFilePair).isEmpty()
    }

    private companion object {
        val mainId = NodeId.fromSegments(listOf("Main.kt"))
        val utilId = NodeId.fromSegments(listOf("src", "Util.kt"))
    }
}
