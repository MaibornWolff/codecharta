package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import org.treesitter.TSNode

private const val CONST_SPEC = "const_spec"

/**
 * Extracts all identifiers from const declaration.
 * Handles both single spec and spec_list (block) patterns.
 */
internal fun extractAllFromConstDeclaration(node: TSNode, sourceCode: String): List<String> =
    extractAllFromVarOrConstDeclaration(node, sourceCode, CONST_SPEC)
