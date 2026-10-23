package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PythonNameRulesTest {
    private fun pythonNode(dottedPath: String, usedTypes: Set<Type> = emptySet()) = Node.build(
        pathWithName = Path.fromStringWithDots(dottedPath),
        physicalPath = dottedPath.substringBeforeLast(".").replace(".", "/") + ".py",
        language = SupportedLanguage.PYTHON,
        usedTypes = usedTypes
    )

    private fun targetsOf(dottedPath: String, nodes: List<Node>): List<String> = DependencyResolverService
        .resolveNodes(listOf(FileReport(nodes)))
        .first { it.pathWithName.withDots() == dottedPath }
        .resolvedNodeDependencies.internalDependencies
        .map { it.withDots() }

    @Test
    fun `should resolve a name written with its module path to exactly that declaration`() {
        // Arrange
        val user = pythonNode("svcB.app.x.X", setOf(Type.simple("svcA.app.models.Model")))
        val nodes = listOf(user, pythonNode("svcA.app.models.Model"), pythonNode("svcB.app.models.Model"))

        // Act
        val targets = targetsOf("svcB.app.x.X", nodes)

        // Assert
        assertThat(targets).containsExactly("svcA.app.models.Model")
    }

    @Test
    fun `should resolve a name written with a module path that declares nothing of that name to nothing`() {
        // Arrange
        val user = pythonNode("svcB.app.models.User", setOf(Type.simple("svcA.app.models.Model")))
        val nodes = listOf(user, pythonNode("svcB.app.models.Model"))

        // Act
        val targets = targetsOf("svcB.app.models.User", nodes)

        // Assert
        assertThat(targets).isEmpty()
    }
}
