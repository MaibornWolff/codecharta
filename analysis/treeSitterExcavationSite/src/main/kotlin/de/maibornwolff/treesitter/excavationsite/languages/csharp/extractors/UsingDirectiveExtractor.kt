package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object UsingDirectiveExtractor {
    private const val USING_DIRECTIVE = "using_directive"
    private const val NAMESPACE_DECLARATION = "namespace_declaration"
    private const val FILE_SCOPED_NAMESPACE = "file_scoped_namespace_declaration"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val IDENTIFIER = "identifier"
    private const val NAMESPACE_SEPARATOR = "."

    fun extract(rootNode: TSNode, sourceCode: String): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, USING_DIRECTIVE)
        .mapNotNull { toImportDeclaration(it, sourceCode, aggregateNamespacePath(it, sourceCode)) }

    private fun aggregateNamespacePath(node: TSNode, sourceCode: String): List<String> {
        val segments = mutableListOf<List<String>>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type == NAMESPACE_DECLARATION || current.type == FILE_SCOPED_NAMESPACE) {
                segments.add(0, extractNamespacePath(current, sourceCode))
            }
            current = current.parent
        }
        return segments.flatten()
    }

    private fun toImportDeclaration(node: TSNode, sourceCode: String, namespacePath: List<String>): ImportDeclaration? {
        val nameText = extractImportPath(node, sourceCode) ?: return null
        return ImportDeclaration(
            path = nameText.split(NAMESPACE_SEPARATOR),
            isWildcard = true,
            namespacePath = namespacePath
        )
    }

    private fun extractImportPath(node: TSNode, sourceCode: String): String? = extractQualifiedOrAliasedPath(node, sourceCode)
        ?: extractSimpleIdentifierPath(node, sourceCode)

    private fun extractQualifiedOrAliasedPath(node: TSNode, sourceCode: String): String? =
        TreeTraversal.findFirstChildTextByType(node, sourceCode, QUALIFIED_NAME)

    private fun extractSimpleIdentifierPath(node: TSNode, sourceCode: String): String? = node
        .children()
        .filter { it.type == IDENTIFIER }
        .map { TreeTraversal.getNodeText(it, sourceCode) }
        .toList()
        .lastOrNull()

    private fun extractNamespacePath(node: TSNode, sourceCode: String): List<String> {
        val text = TreeTraversal.findFirstChildTextByType(node, sourceCode, QUALIFIED_NAME, IDENTIFIER)
            ?: return emptyList()
        return text.split(NAMESPACE_SEPARATOR)
    }
}
