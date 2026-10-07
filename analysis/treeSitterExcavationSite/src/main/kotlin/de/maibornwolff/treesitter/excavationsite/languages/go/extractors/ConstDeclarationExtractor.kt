package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val CONST_SPEC = "const_spec"

/**
 * Extracts first identifier from const declaration.
 * Handles both single spec and spec_list patterns.
 */
internal fun extractFromConstDeclaration(node: SyntaxNode, sourceCode: String): String? =
    extractFromVarOrConstDeclaration(node, sourceCode, CONST_SPEC)
