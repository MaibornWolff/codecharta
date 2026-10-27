package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax.CppNamespaceWalker
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The named namespaces a file opens, each once and with those `a::b` opens on the way, reported below [NAMESPACE]
 * plus the namespaces around it, as it declares no leaf but tells a namespace from a class: `bool util::log::f() {}`
 * defines a function of the namespace `util::log` when the file sees one (`cpp.md`, decision 14).
 */
internal object NamespaceDeclarationFinder {
    const val NAMESPACE = "NAMESPACE"

    private const val NAMESPACE_DEFINITION = "namespace_definition"

    fun find(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, NAMESPACE_DEFINITION)
        .map { CppNamespaceWalker.walkAncestorsFrom(it) + CppNamespaceWalker.segmentsOf(it) }
        .flatMap { path -> (1..path.size).map { path.take(it) } }
        .distinct()
        .map { path ->
            Declaration(
                name = path.last(),
                type = DeclarationType.UNKNOWN,
                usedTypes = emptySet(),
                parentPath = listOf(NAMESPACE) + path.dropLast(1)
            )
        }
}
