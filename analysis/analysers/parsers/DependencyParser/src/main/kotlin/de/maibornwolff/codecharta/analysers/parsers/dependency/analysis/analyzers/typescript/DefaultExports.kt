package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType

/**
 * The names a module exports, by "Declarations" of `docs/name-resolution/typescript.md`: an anonymous default export
 * is a declaration [LEAF_NAME]; a name that stands for a declaration of its own module (`export default class Base`,
 * `export default settings`, `export { Impl as Service }`) is that declaration and no leaf of its own.
 */
internal object DefaultExports {
    const val LEAF_NAME = "default"

    fun withoutOwnNames(nodes: List<Node>): List<Node> {
        val ownNames = nodes.filterNot { it.nodeType == NodeType.REEXPORT }.mapTo(HashSet()) { it.name() }
        return nodes.filterNot { it.nodeType == NodeType.REEXPORT && it.usedTypes.singleOrNull()?.name in ownNames }
    }
}
