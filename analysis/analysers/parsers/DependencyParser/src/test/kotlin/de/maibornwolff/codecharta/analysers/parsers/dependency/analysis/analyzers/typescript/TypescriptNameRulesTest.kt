package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TypescriptNameRulesTest {
    private fun typescriptNode(dottedPath: String, usedTypes: Set<Type> = emptySet(), dependencies: Set<Dependency> = emptySet()) =
        Node.build(
            pathWithName = Path.fromStringWithDots(dottedPath),
            physicalPath = dottedPath.substringBeforeLast(".").replace(".", "/") + ".ts",
            language = SupportedLanguage.TYPESCRIPT,
            usedTypes = usedTypes,
            dependencies = dependencies
        )

    private fun targetsOf(dottedPath: String, nodes: List<Node>): List<String> = DependencyResolverService
        .resolveNodes(listOf(FileReport(nodes)))
        .first { it.pathWithName.withDots() == dottedPath }
        .resolvedNodeDependencies.internalDependencies
        .map { it.withDots() }

    @Test
    fun `should resolve a name written with its module path to exactly that declaration`() {
        // Arrange
        val user = typescriptNode("src.tree.Tree", setOf(Type.simple("src.other.Node")))
        val nodes = listOf(user, typescriptNode("src.other.Node"), typescriptNode("src.tree.Node"))

        // Act
        val targets = targetsOf("src.tree.Tree", nodes)

        // Assert
        assertThat(targets).containsExactly("src.other.Node")
    }

    @Test
    fun `should resolve a simple name to nothing, also where an import names a module that declares it`() {
        // Arrange
        val user = typescriptNode(
            "src.tree.Tree",
            setOf(Type.simple("Node")),
            setOf(Dependency(Path.fromStringWithDots("src.other"), isWildcard = true))
        )
        val nodes = listOf(user, typescriptNode("src.other.Node"))

        // Act
        val targets = targetsOf("src.tree.Tree", nodes)

        // Assert
        assertThat(targets).isEmpty()
    }
}
