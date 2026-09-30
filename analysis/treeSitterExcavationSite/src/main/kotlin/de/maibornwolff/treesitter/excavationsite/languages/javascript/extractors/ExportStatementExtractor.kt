package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DECORATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_CLAUSE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_SPECIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.STRING
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.DECLARATION_NODE_TYPES
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.hasExportClause
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.hasSource
import de.maibornwolff.treesitter.excavationsite.languages.javascript.normalizeDefaultKeyword
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object ExportStatementExtractor {
    private const val STRING_FRAGMENT = "string_fragment"
    private const val WILDCARD = "*"
    private const val MODULE_DECLARATION = "module"
    private const val STATEMENT_BLOCK = "statement_block"
    private const val MODULE_PATH_SEPARATOR = "/"

    fun extractFromAmbientDeclaration(node: TSNode, scope: DeclarationScope): List<Declaration> {
        val moduleNode = node.children().firstOrNull { it.type == MODULE_DECLARATION } ?: return emptyList()
        val moduleName = extractModuleName(moduleNode, scope.sourceCode) ?: return emptyList()
        if (moduleName.contains(WILDCARD)) return emptyList()
        val parentPath = moduleName.split(MODULE_PATH_SEPARATOR)
        val body = moduleNode.children().firstOrNull { it.type == STATEMENT_BLOCK } ?: return emptyList()
        return body
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(child, scope, parentPath)
                    in DECLARATION_NODE_TYPES -> DeclarationNodeExtractor.extract(child, scope, parentPath)
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
    }

    private fun extractModuleName(moduleNode: TSNode, sourceCode: String): String? = moduleNode
        .children()
        .firstOrNull { it.type == STRING }
        ?.children()
        ?.firstOrNull { it.type == STRING_FRAGMENT }
        ?.let { TreeTraversal.getNodeText(it, sourceCode).trim() }

    fun extractFromExportStatement(node: TSNode, scope: DeclarationScope, parentPath: List<String> = emptyList()): List<Declaration> =
        when {
            hasExportClause(node) && hasSource(node) -> extractReexportDeclarations(node, scope.sourceCode)
            hasSource(node) && !hasExportClause(node) ->
                listOf(Declaration(name = WILDCARD, type = DeclarationType.REEXPORT, usedTypes = emptySet()))

            else -> extractExportedDeclarations(node, scope, parentPath)
        }

    private fun extractExportedDeclarations(node: TSNode, scope: DeclarationScope, parentPath: List<String>): List<Declaration> {
        val decoratorUsedTypes = node
            .children()
            .filter { it.type == DECORATOR }
            .flatMap { UsedTypeExtractor.extract(it, scope.sourceCode, scope.aliasMap, scope.localDeclarationNames).toList() }
            .toSet()
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { DeclarationNodeExtractor.extract(it, scope, parentPath) }
            .map { decl -> if (decoratorUsedTypes.isEmpty()) decl else decl.copy(usedTypes = decl.usedTypes + decoratorUsedTypes) }
            .toList()
    }

    private fun extractReexportDeclarations(node: TSNode, sourceCode: String): List<Declaration> {
        val exportClause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
        return exportClause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier ->
                val identifiers = specifier
                    .children()
                    .filter { it.type == IDENTIFIER }
                    .map { TreeTraversal.getNodeText(it, sourceCode).trim() }
                    .toList()
                reexportDeclaration(identifiers)
            }.toList()
    }

    private fun reexportDeclaration(identifiers: List<String>): Declaration? {
        val (exportedName, originalName) = when (identifiers.size) {
            1 -> identifiers[0] to identifiers[0]
            2 -> identifiers[1] to identifiers[0]
            else -> return null
        }
        return Declaration(
            name = exportedName,
            type = DeclarationType.REEXPORT,
            usedTypes = setOf(UsedType(normalizeDefaultKeyword(originalName)))
        )
    }
}
