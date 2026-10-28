package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type

/**
 * The names a module declares itself, by rules 1 and 2 of "A simple name" in `docs/name-resolution/typescript.md`: a
 * simple name means the declaration of the innermost namespace around its use that declares it, else the module's
 * top-level declaration of that name, and is written as its full path. A re-export binds no name in its module.
 */
internal object OwnNames {
    private const val SEPARATOR = "."

    fun writtenInFull(nodes: List<Node>, modulePath: Path): List<Node> {
        val ownPaths = nodes.filter { it.nodeType != NodeType.REEXPORT }.mapTo(HashSet()) { it.pathWithName.withDots() }
        return nodes.map { node ->
            val scopes = scopesAround(node.pathWithName, modulePath)
            node.copy(usedTypes = node.usedTypes.mapTo(LinkedHashSet()) { inFull(it, scopes, ownPaths) })
        }
    }

    // The namespaces around a declaration, innermost first, down to its module, or the `declare module` block it lies in
    private fun scopesAround(path: Path, modulePath: Path): List<Path> {
        val isInModule = path.parts.take(modulePath.parts.size) == modulePath.parts
        val outermost = if (isInModule) modulePath.parts.size else path.parts.size - 1
        val innermost = maxOf(path.parts.size - 1, outermost)
        return (innermost downTo outermost).map { Path(path.parts.take(it)) }
    }

    private fun inFull(type: Type, scopes: List<Path>, ownPaths: Set<String>): Type {
        val genericTypes = type.genericTypes.map { inFull(it, scopes, ownPaths) }
        val fullName = if (type.name.contains(
                SEPARATOR
            )
        ) {
            null
        } else {
            scopes.map { (it + type.name).withDots() }.firstOrNull { it in ownPaths }
        }
        return type.copy(name = fullName ?: type.name, genericTypes = genericTypes)
    }
}
