package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object PackageExtractor {
    private const val PACKAGE_DECLARATION = "package_declaration"
    private const val SCOPED_IDENTIFIER = "scoped_identifier"
    private const val IDENTIFIER = "identifier"
    private const val PACKAGE_SEPARATOR = "."

    fun extract(rootNode: SyntaxNode): List<String> {
        val packageNode = rootNode.children().firstOrNull { it.type == PACKAGE_DECLARATION }
            ?: return emptyList()
        val packageText = TreeTraversal.findFirstChildTextByType(packageNode, SCOPED_IDENTIFIER, IDENTIFIER)
            ?: return emptyList()
        return packageText.split(PACKAGE_SEPARATOR)
    }
}
