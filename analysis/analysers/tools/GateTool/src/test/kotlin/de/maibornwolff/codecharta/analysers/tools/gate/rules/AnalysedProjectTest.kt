package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.DependencyNode
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
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
                            listOf(Edge("/root/Main.kt", "/root/src/Util.kt", isCyclic = true, isPointingUpwards = true)),
                            nodes = mapOf("main" to DependencyNode(0))
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
    fun `should list the dependencies between files by their paths from the project root`() {
        // Arrange
        val analysedProject = AnalysedProject(project)

        // Act
        val dependencies = analysedProject.dependencies

        // Assert
        assertThat(dependencies).containsExactly(FileDependency("Main.kt", "src/Util.kt", isCyclic = true, isPointingUpwards = true))
    }

    @Test
    fun `should know whether the map carries the dependency analysis`() {
        // Arrange
        val withoutAnalysis =
            Project(
                "omitted",
                listOf(Node("root", NodeType.Folder)),
                lenses = LensSet(dependency = DependencyLens(listOf(Edge("/root/A.kt", "/root/B.kt"))))
            )

        // Act
        val withAnalysisFound = AnalysedProject(project).hasDependencyAnalysis
        val withoutAnalysisFound = AnalysedProject(withoutAnalysis).hasDependencyAnalysis

        // Assert
        assertThat(withAnalysisFound).isTrue()
        assertThat(withoutAnalysisFound).isFalse()
    }
}
