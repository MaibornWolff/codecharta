package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.contract

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.extractFrom
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

// TODO: includes with relative pathes should be build like those via the import mechanism. that means those dependencies should have isDotImport = true

abstract class AnalysisPipelineContractTests {
    abstract val nodesBuilder: ExpectedNodesBuilder
    abstract val rootDirectory: String
    abstract val language: SupportedLanguage

    @Test
    fun `result of analyzed files should match expected`() {
        // given
        val expectedNodesFromAllFiles = nodesBuilder.build()

        // when
        val result = extractFrom(rootDirectory, language)

        // then
        assertThat(
            result
                .flatMap { it.nodes.map { node -> node.name() } }
                .containsAll(
                    expectedNodesFromAllFiles.flatMap { it.nodes.map { node -> node.name() } }
                )
        )

        expectedNodesFromAllFiles.forEach { expectedNodesOfFile ->
            val nodesToAssert =
                result
                    .filter { it.nodes.any { node -> node.pathWithName.getName() == expectedNodesOfFile.fileName } }
                    .flatMap { it.nodes }
            val expectedNodes = expectedNodesOfFile.nodes
            assertThat(nodesToAssert.size)
                .withFailMessage(
                    "Expected ${expectedNodes.size} nodes, but found ${nodesToAssert.size} in file ${expectedNodesOfFile.fileName}"
                ).isEqualTo(expectedNodes.size)

            val assertionNodesByName = nodesToAssert.groupBy { it.name() }
            expectedNodes.forEach { expectedNode ->
                val actualNode = findActualNode(assertionNodesByName, expectedNode, expectedNodesOfFile)
                assertNode(
                    expectedNode,
                    actualNode,
                    expectedNodesOfFile.ignorableDependencies,
                    expectedNodesOfFile.ignorableTypes
                )
            }
        }
    }

    private fun findActualNode(assertionNodesByName: Map<String, List<Node>>, expectedNode: Node, expectedNodesOfFile: ExpectedNode): Node {
        val foundNodes = assertionNodesByName[expectedNode.name()]
            .let {
                it
                    ?: throw AssertionError(
                        "Node ${expectedNode.name()} not found in analyzed nodes for file ${expectedNodesOfFile.fileName}"
                    )
            }

        val actualNode = if (foundNodes.size == 1) {
            foundNodes.first()
        } else {
            foundNodes.singleOrNull { it.physicalPath.replace("\\", "/").contains(expectedNode.physicalPath) }
                ?: throw AssertionError(
                    "Node ${expectedNode.name()} found multiple times in analyzed nodes for file ${expectedNodesOfFile.fileName}, " +
                        "but no unique match for physical path ${expectedNode.physicalPath} found. Found: ${foundNodes.map {
                            it.physicalPath
                        }}"
                )
        }
        return actualNode
    }

    private fun assertNode(expectedNode: Node, actualNode: Node, ignorableDependencies: Set<Dependency>, ignorableUsedTypes: Set<Type>) {
        val message =
            "Node ${actualNode.name()} with Path ${actualNode.physicalPath} does not match expected node ${expectedNode.name()}"
        assertThat(expectedNode.pathWithName)
            .describedAs { message }
            .isEqualTo(actualNode.pathWithName)
        assertThat(expectedNode.nodeType)
            .describedAs { message }
            .isEqualTo(actualNode.nodeType)

        if (expectedNode.dependencies.isEmpty()) {
            assertThat(actualNode.dependencies)
                .describedAs { message }
                .isSubsetOf(ignorableDependencies)
        } else {
            expectedNode.dependencies.forEach { expected ->
                assertThat(actualNode.dependencies)
                    .describedAs { message }
                    .contains(expected)
            }
        }

        if (expectedNode.usedTypes.isEmpty()) {
            assertThat(actualNode.usedTypes)
                .describedAs { message }
                .isSubsetOf(ignorableUsedTypes)
        } else {
            expectedNode.usedTypes.forEach { expected ->
                assertThat(actualNode.usedTypes)
                    .describedAs { message }
                    .contains(expected)
            }
        }
    }
}
