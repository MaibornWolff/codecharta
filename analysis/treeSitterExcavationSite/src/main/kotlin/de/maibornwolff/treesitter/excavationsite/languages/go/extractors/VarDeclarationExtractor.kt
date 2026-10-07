package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val VAR_SPEC = "var_spec"

/**
 * Extracts first identifier from var declaration.
 * Handles both single spec and spec_list patterns.
 */
internal fun extractFromVarDeclaration(node: SyntaxNode): String? = extractFromVarOrConstDeclaration(node, VAR_SPEC)
