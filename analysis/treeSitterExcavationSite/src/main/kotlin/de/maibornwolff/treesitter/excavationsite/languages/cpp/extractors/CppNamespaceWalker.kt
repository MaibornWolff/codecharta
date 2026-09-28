package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

internal object CppNamespaceWalker {
    private const val NAMESPACE_DEFINITION = "namespace_definition"
    private const val NAMESPACE_IDENTIFIER = "namespace_identifier"
    private const val NESTED_NAMESPACE_SPECIFIER = "nested_namespace_specifier"
    private const val NAMESPACE_SEPARATOR = "::"

    fun walkAncestorsFrom(node: TSNode, sourceCode: String): List<String> {
        val segments = mutableListOf<List<String>>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type == NAMESPACE_DEFINITION) {
                segments.add(0, extractSegments(current, sourceCode))
            }
            current = current.parent
        }
        return segments.flatten()
    }

    fun firstFileNamespace(rootNode: TSNode, sourceCode: String): List<String> {
        val namespaceNode = TreeTraversal
            .findAllDescendantsOfType(rootNode, NAMESPACE_DEFINITION)
            .firstOrNull() ?: return emptyList()
        return extractSegments(namespaceNode, sourceCode)
    }

    private fun extractSegments(namespaceDef: TSNode, sourceCode: String): List<String> {
        val text = TreeTraversal.findFirstChildTextByType(
            namespaceDef,
            sourceCode,
            NAMESPACE_IDENTIFIER,
            NESTED_NAMESPACE_SPECIFIER
        ) ?: return emptyList()
        return text.split(NAMESPACE_SEPARATOR)
    }
}
