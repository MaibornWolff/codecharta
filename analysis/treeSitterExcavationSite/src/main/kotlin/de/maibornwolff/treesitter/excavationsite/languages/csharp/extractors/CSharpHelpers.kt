package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val VARIABLE_DECLARATOR = "variable_declarator"

/**
 * Finds identifier inside variable_declarator.
 *
 * Used by various extractors for finding variables in declarations.
 */
internal fun findIdentifierInVariableDeclarator(node: SyntaxNode): String? = node
    .children()
    .firstOrNull { it.type == VARIABLE_DECLARATOR }
    ?.let { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER) }
