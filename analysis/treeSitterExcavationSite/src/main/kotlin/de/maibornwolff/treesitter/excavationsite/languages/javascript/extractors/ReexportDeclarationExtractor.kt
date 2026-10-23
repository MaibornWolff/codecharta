package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

private const val WILDCARD_REEXPORT = "*"
private const val PLAIN_SPECIFIER_SIZE = 1
private const val ALIASED_SPECIFIER_SIZE = 2
private const val PATH_SEPARATOR = "/"

internal object ReexportDeclarationExtractor {
    // `export * as shapes from` binds a module, which is no declaration
    fun extract(exportNode: SyntaxNode): List<Declaration> = when {
        hasExportClause(exportNode) -> extractNamedReexports(exportNode)
        exportNode.children().any { it.type == NAMESPACE_EXPORT } -> emptyList()
        else -> listOf(Declaration(name = WILDCARD_REEXPORT, type = DeclarationType.REEXPORT, usedTypes = emptySet()))
    }

    private fun extractNamedReexports(node: SyntaxNode): List<Declaration> {
        val exportClause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
        val modulePath = modulePathOf(node)
        return exportClause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier -> reexportFromSpecifier(specifier, modulePath) }
            .toList()
    }

    // The specifier of `export { … } from './m'`, split at its slashes; empty for an export list without `from`
    private fun modulePathOf(exportNode: SyntaxNode): List<String> = exportNode
        .children()
        .firstOrNull { it.type == STRING }
        ?.children()
        ?.firstOrNull { it.type == STRING_FRAGMENT }
        ?.text
        ?.split(PATH_SEPARATOR)
        .orEmpty()

    private fun reexportFromSpecifier(specifier: SyntaxNode, modulePath: List<String>): Declaration? {
        val identifiers = specifier
            .children()
            .filter { it.type == IDENTIFIER }
            .map { it.text.trim() }
            .toList()
        if (identifiers.size != PLAIN_SPECIFIER_SIZE && identifiers.size != ALIASED_SPECIFIER_SIZE) return null
        val originalName = normalizeDefaultKeyword(identifiers.first())
        // The default export of another module is named by that module, as no name of this file means it
        val use = if (originalName == DEFAULT_EXPORT) UsedType(originalName, namespacePrefix = modulePath) else UsedType(originalName)
        return Declaration(name = identifiers.last(), type = DeclarationType.REEXPORT, usedTypes = setOf(use))
    }
}
