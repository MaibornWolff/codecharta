package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object ImportExtractor {
    private const val IMPORT_LIST = "import_list"
    private const val IMPORT_HEADER = "import_header"
    private const val IDENTIFIER = "identifier"
    private const val WILDCARD_IMPORT = "wildcard_import"
    private const val IMPORT_SEPARATOR = "."

    fun extract(rootNode: TSNode, sourceCode: String): List<ImportDeclaration> {
        val importList = rootNode.children().firstOrNull { it.type == IMPORT_LIST }
            ?: return emptyList()
        return importList
            .children()
            .filter { it.type == IMPORT_HEADER }
            .mapNotNull { importNode ->
                val identifierText = TreeTraversal.findFirstChildTextByType(importNode, sourceCode, IDENTIFIER)
                if (identifierText.isNullOrBlank()) return@mapNotNull null
                val isWildcard = importNode.children().any { it.type == WILDCARD_IMPORT }
                ImportDeclaration(path = identifierText.split(IMPORT_SEPARATOR), isWildcard = isWildcard)
            }.toList()
    }
}
