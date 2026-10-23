package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

private const val WILDCARD_REEXPORT = "*"
private const val PLAIN_SPECIFIER_SIZE = 1
private const val ALIASED_SPECIFIER_SIZE = 2

internal object ReexportDeclarationExtractor {
    // `export * as shapes from` binds a module, which is no declaration
    fun extract(exportNode: SyntaxNode): List<Declaration> = when {
        hasExportClause(exportNode) -> extractNamedReexports(exportNode)
        exportNode.children().any { it.type == NAMESPACE_EXPORT } -> emptyList()
        else -> listOf(Declaration(name = WILDCARD_REEXPORT, type = DeclarationType.REEXPORT, usedTypes = emptySet()))
    }

    private fun extractNamedReexports(node: SyntaxNode): List<Declaration> {
        val exportClause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
        return exportClause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier -> reexportFromSpecifier(specifier) }
            .toList()
    }

    private fun reexportFromSpecifier(specifier: SyntaxNode): Declaration? {
        val identifiers = specifier
            .children()
            .filter { it.type == IDENTIFIER }
            .map { it.text.trim() }
            .toList()
        if (identifiers.size != PLAIN_SPECIFIER_SIZE && identifiers.size != ALIASED_SPECIFIER_SIZE) return null
        val originalName = identifiers.first()
        return Declaration(
            name = identifiers.last(),
            type = DeclarationType.REEXPORT,
            usedTypes = setOf(UsedType(normalizeDefaultKeyword(originalName)))
        )
    }
}
