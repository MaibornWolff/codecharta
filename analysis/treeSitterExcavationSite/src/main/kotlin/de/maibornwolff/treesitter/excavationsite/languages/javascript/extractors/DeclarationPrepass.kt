package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object DeclarationPrepass {
    internal fun buildAliasMap(imports: List<ImportDeclaration>): Map<String, String> = imports
        .mapNotNull { import ->
            val localName = import.bindingName ?: return@mapNotNull null
            val realName = if (import.isWildcard || import.path.lastOrNull() == DEFAULT_EXPORT) {
                localName
            } else {
                import.path.lastOrNull() ?: return@mapNotNull null
            }
            localName to realName
        }.toMap()

    internal fun extractLocalDeclarationNames(rootNode: SyntaxNode): Set<String> = rootNode
        .children()
        .flatMap { child ->
            when (child.type) {
                EXPORT_STATEMENT -> extractNamesFromExportStatement(child)
                in DECLARATION_NODE_TYPES -> extractNamesFromNode(child)
                else -> emptyList()
            }
        }.filter { it.isNotBlank() }
        .toSet()

    private fun extractNamesFromExportStatement(node: SyntaxNode): List<String> {
        if (hasSource(node)) return emptyList()
        val hasExportClause = hasExportClause(node)
        if (hasExportClause) {
            val clause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
            return clause
                .children()
                .filter { it.type == EXPORT_SPECIFIER }
                .mapNotNull { specifier ->
                    specifier
                        .children()
                        .filter { it.type == IDENTIFIER }
                        .firstOrNull()
                        ?.text
                        ?.trim()
                }.toList()
        }
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { extractNamesFromNode(it) }
            .toList()
    }

    private fun extractNamesFromNode(node: SyntaxNode): List<String> {
        if (node.type == LEXICAL_DECLARATION || node.type == VARIABLE_DECLARATION) {
            return node
                .children()
                .filter { it.type == VARIABLE_DECLARATOR }
                .mapNotNull { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER)?.trim() }
                .filter { it.isNotBlank() }
                .toList()
        }
        val name = extractDeclarationName(node)
        return if (name.isNotBlank()) listOf(name) else emptyList()
    }
}
