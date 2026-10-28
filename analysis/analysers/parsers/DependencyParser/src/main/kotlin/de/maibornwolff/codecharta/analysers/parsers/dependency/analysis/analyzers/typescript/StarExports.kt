package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.WILDCARD_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import java.io.File

/**
 * What the `export * from` of one module re-exports, by decision 8 of `docs/name-resolution/typescript.md`: one
 * re-export declaration per name a source module exports by name, without its default export, a name the module
 * declares or exports itself, and a name two sources offer.
 */
internal class StarExports(private val analysisRoot: File) {
    private val sources = LinkedHashSet<File>()

    /** Remembers the module an `export * from` names; `export * as ns from` binds the module as one name instead. */
    fun remember(import: ImportDeclaration, moduleFile: File) {
        if (import.isWildcard && import.kind == ImportKind.REEXPORT && import.bindingName == null) sources.add(moduleFile)
    }

    /** The nodes of the module at [modulePath] with its `export *` node replaced by one re-export node per name. */
    fun expandedIn(nodes: List<Node>, modulePath: Path): List<Node> {
        val ownNames = nodes.filterNot { isStarExport(it) }.mapNotNullTo(HashSet()) { it.pathWithName.parts.lastOrNull() }
        return nodes.flatMap { node -> if (isStarExport(node)) expanded(node, modulePath, ownNames) else listOf(node) }
    }

    private fun isStarExport(node: Node) = node.pathWithName.parts.lastOrNull() == WILDCARD_EXPORT_NAME

    // One re-export leaf per name `export *` re-exports, pointing at the declaration that name means in its module
    private fun expanded(starExport: Node, modulePath: Path, ownNames: Set<String>): List<Node> {
        if (sources.isEmpty()) return listOf(starExport)
        val exports = ModuleExports.of(analysisRoot)
        return exports.starExports(sources.toList(), ownNames).map { (name, source) ->
            val target = ImportedModules.logicalPathOf(source, analysisRoot) + exports.nameOf(source, name)
            Node(
                pathWithName = modulePath + name,
                physicalPath = starExport.physicalPath,
                language = starExport.language,
                nodeType = NodeType.REEXPORT,
                dependencies = setOf(Dependency(path = target)),
                usedTypes = setOf(Type.simple(target.withDots()))
            )
        }
    }
}
