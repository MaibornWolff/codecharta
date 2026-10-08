package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object PackageExtractor {
    private const val PACKAGE_HEADER = "package_header"
    private const val IDENTIFIER = "identifier"
    private const val PACKAGE_SEPARATOR = "."

    fun extract(rootNode: SyntaxNode): List<String> {
        val packageNode = rootNode.children().firstOrNull { it.type == PACKAGE_HEADER }
            ?: return emptyList()
        val packageText = TreeTraversal.findFirstChildTextByType(packageNode, IDENTIFIER)
            ?: return emptyList()
        return packageText.split(PACKAGE_SEPARATOR)
    }
}
