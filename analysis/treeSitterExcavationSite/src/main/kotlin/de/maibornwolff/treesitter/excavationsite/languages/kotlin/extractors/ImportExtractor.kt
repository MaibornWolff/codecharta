package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object ImportExtractor {
    private const val IMPORT_LIST = "import_list"
    private const val IMPORT_HEADER = "import_header"
    private const val IDENTIFIER = "identifier"
    private const val WILDCARD_IMPORT = "wildcard_import"
    private const val IMPORT_ALIAS = "import_alias"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val IMPORT_SEPARATOR = "."

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> {
        val importList = rootNode.children().firstOrNull { it.type == IMPORT_LIST }
            ?: return emptyList()
        return importList
            .children()
            .filter { it.type == IMPORT_HEADER }
            .mapNotNull { importNode ->
                val identifierText = TreeTraversal.findFirstChildTextByType(importNode, IDENTIFIER)
                if (identifierText.isNullOrBlank()) return@mapNotNull null
                val isWildcard = importNode.children().any { it.type == WILDCARD_IMPORT }
                ImportDeclaration(
                    path = identifierText.split(IMPORT_SEPARATOR).map { it.trim() },
                    isWildcard = isWildcard,
                    bindingName = aliasOf(importNode)
                )
            }.toList()
    }

    /** The names a file can use without qualifying them: the alias of an import, or its last segment. */
    fun importedNames(rootNode: SyntaxNode): Set<String> = extract(rootNode)
        .filterNot { it.isWildcard }
        .mapNotNull { it.bindingName ?: it.path.lastOrNull() }
        .toSet()

    private fun aliasOf(importNode: SyntaxNode): String? = importNode
        .children()
        .firstOrNull { it.type == IMPORT_ALIAS }
        ?.let { TreeTraversal.findFirstChildTextByType(it, TYPE_IDENTIFIER) }
        ?.trim()
}
