package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType

/**
 * The default export of a module, by "Declarations" of `docs/name-resolution/typescript.md`: an anonymous one is a
 * declaration [LEAF_NAME]; one that names a declaration of its own module (`export default class Base`,
 * `export default settings`) is that declaration and no leaf of its own.
 */
internal object DefaultExports {
    const val LEAF_NAME = "default"

    fun withoutOwnNames(nodes: List<Node>): List<Node> {
        val ownNames = nodes.filterNot { isDefaultExport(it) }.mapTo(HashSet()) { it.name() }
        return nodes.filterNot { isDefaultExport(it) && it.nodeType == NodeType.REEXPORT && namesOwnDeclaration(it, ownNames) }
    }

    private fun isDefaultExport(node: Node): Boolean = node.name() == LEAF_NAME

    private fun namesOwnDeclaration(node: Node, ownNames: Set<String>): Boolean = node.usedTypes.singleOrNull()?.name in ownNames
}
