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
        val namespaceNodes = TreeTraversal.findAllDescendantsOfType(rootNode, NAMESPACE_DEFINITION, NAMESPACE_NAME).map { it.type to it }
        if (namespaceNodes.none { (type, _) -> type == NAMESPACE_DEFINITION }) return emptyList()
        val firstName = namespaceNodes.firstOrNull { (type, _) -> type == NAMESPACE_NAME }?.second ?: return emptyList()
        return firstName.text.split(NamespaceUses.NAMESPACE_SEPARATOR)
    }
}
