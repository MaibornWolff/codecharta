package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The namespace of a file that defines one, otherwise empty. It is read from the first namespace name of the file,
 * which is the one of the definition unless a qualified name stands before it or the definition has no name, as in
 * `namespace { use A\B; }`.
 */
internal object PackageExtractor {
    private const val NAMESPACE_DEFINITION = "namespace_definition"
    private const val NAMESPACE_NAME = "namespace_name"

    fun extract(rootNode: SyntaxNode): List<String> {
        val nodesByType = TreeTraversal.findAllDescendantsGroupedByType(rootNode, setOf(NAMESPACE_DEFINITION, NAMESPACE_NAME))
        if (NAMESPACE_DEFINITION !in nodesByType) return emptyList()
        val firstNamespaceName = nodesByType[NAMESPACE_NAME]?.firstOrNull() ?: return emptyList()
        return firstNamespaceName.text.split(NamespaceUses.NAMESPACE_SEPARATOR)
    }
}
