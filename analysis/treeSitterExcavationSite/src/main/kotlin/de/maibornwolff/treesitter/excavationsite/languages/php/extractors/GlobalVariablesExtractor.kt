package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val VARIABLE_NAME = "variable_name"

/**
 * Extracts all variable names from global declaration.
 * Example: `global $x, $y, $z;` -> ["x", "y", "z"]
 */
internal fun extractGlobalVariables(node: SyntaxNode): List<String> = node
    .children()
    .filter { it.type == VARIABLE_NAME }
    .map { stripDollarPrefix(it.text) }
    .toList()
