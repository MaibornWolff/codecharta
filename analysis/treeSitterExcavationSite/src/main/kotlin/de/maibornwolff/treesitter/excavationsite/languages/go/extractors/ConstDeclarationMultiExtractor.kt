package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val CONST_SPEC = "const_spec"

/**
 * Extracts all identifiers from const declaration.
 * Handles both single spec and spec_list (block) patterns.
 */
internal fun extractAllFromConstDeclaration(node: SyntaxNode): List<String> = extractAllFromVarOrConstDeclaration(node, CONST_SPEC)
