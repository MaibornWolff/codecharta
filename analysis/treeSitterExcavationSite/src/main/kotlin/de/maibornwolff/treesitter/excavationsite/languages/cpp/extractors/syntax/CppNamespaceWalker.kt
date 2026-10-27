package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object CppNamespaceWalker {
    private const val NAMESPACE_DEFINITION = "namespace_definition"
    private const val NAMESPACE_IDENTIFIER = "namespace_identifier"
    private const val NESTED_NAMESPACE_SPECIFIER = "nested_namespace_specifier"
    private const val NAMESPACE_SEPARATOR = "::"

    fun walkAncestorsFrom(node: SyntaxNode): List<String> {
        val segments = mutableListOf<List<String>>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type == NAMESPACE_DEFINITION) {
                segments.add(0, segmentsOf(current))
            }
            current = current.parent
        }
        return segments.flatten()
    }

    fun firstFileNamespace(rootNode: SyntaxNode): List<String> {
        val namespaceNode = TreeTraversal
            .findAllDescendantsOfType(rootNode, NAMESPACE_DEFINITION)
            .firstOrNull() ?: return emptyList()
        return segmentsOf(namespaceNode)
    }

    /** The segments the namespace definition [namespaceDef] names, none for an unnamed namespace. */
    fun segmentsOf(namespaceDef: SyntaxNode): List<String> {
        val text = TreeTraversal.findFirstChildTextByType(
            namespaceDef,
            NAMESPACE_IDENTIFIER,
            NESTED_NAMESPACE_SPECIFIER
        ) ?: return emptyList()
        return text.split(NAMESPACE_SEPARATOR)
    }
}
