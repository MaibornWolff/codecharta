package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import org.treesitter.TSNode

private const val VAR_SPEC = "var_spec"

/**
 * Extracts first identifier from var declaration.
 * Handles both single spec and spec_list patterns.
 */
internal fun extractFromVarDeclaration(node: TSNode, sourceCode: String): String? =
    extractFromVarOrConstDeclaration(node, sourceCode, VAR_SPEC)
