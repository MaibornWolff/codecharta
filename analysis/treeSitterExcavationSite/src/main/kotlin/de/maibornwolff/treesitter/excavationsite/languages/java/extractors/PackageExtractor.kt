package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object PackageExtractor {
    private const val PACKAGE_DECLARATION = "package_declaration"
    private const val SCOPED_IDENTIFIER = "scoped_identifier"
    private const val IDENTIFIER = "identifier"
    private const val PACKAGE_SEPARATOR = "."

    fun extract(rootNode: TSNode, sourceCode: String): List<String> {
        val packageNode = rootNode.children().firstOrNull { it.type == PACKAGE_DECLARATION }
            ?: return emptyList()
        val packageText = TreeTraversal.findFirstChildTextByType(packageNode, sourceCode, SCOPED_IDENTIFIER, IDENTIFIER)
            ?: return emptyList()
        return packageText.split(PACKAGE_SEPARATOR)
    }
}
