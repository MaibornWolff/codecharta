package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/**
 * A C# base list names the base class and the interfaces alike, so its entries arrive as inheritance; once they are
 * resolved, an interface that a class, record or struct names there is one it implements (decision 5 of csharp.md).
 */
internal object CSharpImplementedInterfaces {
    fun mark(resolvedNodes: List<Node>): List<Node> {
        val interfacePaths = resolvedNodes.filter { it.nodeType == NodeType.INTERFACE }.mapTo(HashSet()) { it.pathWithName.withDots() }
        return resolvedNodes.map { node -> if (namesInterfacesItImplements(node)) node.withImplementedInterfaces(interfacePaths) else node }
    }

    private fun namesInterfacesItImplements(node: Node): Boolean =
        node.language == SupportedLanguage.C_SHARP && node.nodeType != NodeType.INTERFACE

    private fun Node.withImplementedInterfaces(interfacePaths: Set<String>): Node {
        fun kindOf(dependency: Dependency): Dependency =
            if (dependency.type == TypeOfUsage.INHERITANCE && dependency.withDots() in interfacePaths) {
                dependency.copy(type = TypeOfUsage.IMPLEMENTATION)
            } else {
                dependency
            }
        return copy(
            dependencies = dependencies.mapTo(LinkedHashSet(), ::kindOf),
            resolvedNodeDependencies = resolvedNodeDependencies.copy(
                internalDependencies = resolvedNodeDependencies.internalDependencies.mapTo(LinkedHashSet(), ::kindOf)
            )
        )
    }
}
