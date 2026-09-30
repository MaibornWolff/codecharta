package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_CLAUSE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_SPECIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.VARIABLE_DECLARATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.DECLARATION_NODE_TYPES
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.LEXICAL_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.VARIABLE_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.extractName
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.hasExportClause
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.hasSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

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

    internal fun extractLocalDeclarationNames(rootNode: TSNode, sourceCode: String): Set<String> = rootNode
        .children()
        .flatMap { child ->
            when (child.type) {
                EXPORT_STATEMENT -> extractNamesFromExportStatement(child, sourceCode)
                in DECLARATION_NODE_TYPES -> extractNamesFromNode(child, sourceCode)
                else -> emptyList()
            }
        }.filter { it.isNotBlank() }
        .toSet()

    private fun extractNamesFromExportStatement(node: TSNode, sourceCode: String): List<String> {
        if (hasSource(node)) return emptyList()
        if (hasExportClause(node)) return extractExportClauseNames(node, sourceCode)
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { extractNamesFromNode(it, sourceCode) }
            .toList()
    }

    private fun extractExportClauseNames(node: TSNode, sourceCode: String): List<String> {
        val clause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
        return clause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier ->
                specifier
                    .children()
                    .filter { it.type == IDENTIFIER }
                    .firstOrNull()
                    ?.let { TreeTraversal.getNodeText(it, sourceCode).trim() }
            }.toList()
    }

    private fun extractNamesFromNode(node: TSNode, sourceCode: String): List<String> {
        if (node.type == LEXICAL_DECLARATION || node.type == VARIABLE_DECLARATION) {
            return node
                .children()
                .filter { it.type == VARIABLE_DECLARATOR }
                .mapNotNull { TreeTraversal.findFirstChildTextByType(it, sourceCode, IDENTIFIER)?.trim() }
                .filter { it.isNotBlank() }
                .toList()
        }
        val name = extractName(node, sourceCode)
        return if (name.isNotBlank()) listOf(name) else emptyList()
    }
}
