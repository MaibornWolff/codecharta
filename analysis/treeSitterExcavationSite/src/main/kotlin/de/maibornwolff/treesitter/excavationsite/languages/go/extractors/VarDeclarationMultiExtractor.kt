package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val VAR_SPEC = "var_spec"

/**
 * Extracts all identifiers from var declaration.
 * Handles both single spec and spec_list (block) patterns.
 */
internal fun extractAllFromVarDeclaration(node: SyntaxNode): List<String> = extractAllFromVarOrConstDeclaration(node, VAR_SPEC)
