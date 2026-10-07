package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

internal object UsingDirectiveExtractor {
    private const val USING_DIRECTIVE = "using_directive"
    private const val NAMESPACE_DECLARATION = "namespace_declaration"
    private const val FILE_SCOPED_NAMESPACE = "file_scoped_namespace_declaration"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val IDENTIFIER = "identifier"
    private const val NAMESPACE_SEPARATOR = "."

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, USING_DIRECTIVE)
        .mapNotNull { toImportDeclaration(it, aggregateNamespacePath(it)) }

    private fun aggregateNamespacePath(node: SyntaxNode): List<String> {
        val segments = mutableListOf<List<String>>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type == NAMESPACE_DECLARATION || current.type == FILE_SCOPED_NAMESPACE) {
                segments.add(0, extractNamespacePath(current))
            }
            current = current.parent
        }
        return segments.flatten()
    }

    private fun toImportDeclaration(node: SyntaxNode, namespacePath: List<String>): ImportDeclaration? {
        val nameText = extractImportPath(node) ?: return null
        return ImportDeclaration(
            path = nameText.split(NAMESPACE_SEPARATOR),
            isWildcard = true,
            namespacePath = namespacePath
        )
    }

    private fun extractImportPath(node: SyntaxNode): String? = extractQualifiedOrAliasedPath(node)
        ?: extractSimpleIdentifierPath(node)

    private fun extractQualifiedOrAliasedPath(node: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(node, QUALIFIED_NAME)

    private fun extractSimpleIdentifierPath(node: SyntaxNode): String? = node
        .children()
        .filter { it.type == IDENTIFIER }
        .map { it.text }
        .toList()
        .lastOrNull()

    private fun extractNamespacePath(node: SyntaxNode): List<String> {
        val text = TreeTraversal.findFirstChildTextByType(node, QUALIFIED_NAME, IDENTIFIER)
            ?: return emptyList()
        return text.split(NAMESPACE_SEPARATOR)
    }
}
