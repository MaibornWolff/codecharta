package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val TYPE_SPEC = "type_spec"
private const val TYPE_IDENTIFIER = "type_identifier"

/**
 * Extracts identifier from type declaration.
 * Type declarations nest the identifier inside a type_spec child.
 */
internal fun extractTypeDeclarationIdentifier(node: SyntaxNode): String? = node
    .children()
    .firstOrNull { it.type == TYPE_SPEC }
    ?.let { TreeTraversal.findFirstChildTextByType(it, TYPE_IDENTIFIER) }
