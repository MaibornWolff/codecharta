package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val DOLLAR_PREFIX = "$"
private const val VARIABLE_NAME = "variable_name"
private const val NAME = "name"

/**
 * Strips dollar prefix from PHP variables: `$variable` -> "variable"
 */
internal fun stripDollarPrefix(text: String): String = if (text.startsWith(DOLLAR_PREFIX)) text.removePrefix(DOLLAR_PREFIX) else text

/**
 * Finds first variable_name child and strips dollar prefix.
 * Used for parameters, catch clauses, and static variables.
 */
internal fun findFirstVariableName(node: SyntaxNode): String? = node
    .children()
    .firstOrNull { it.type == VARIABLE_NAME }
    ?.let { stripDollarPrefix(it.text) }

/**
 * Finds first child of a given type and returns its text.
 */
internal fun findFirstChildTextByType(node: SyntaxNode, type: String): String? = node
    .children()
    .firstOrNull { it.type == type }
    ?.text

/**
 * Finds last name child in a node.
 * Used for extracting final name component from qualified names.
 */
internal fun findLastNameChild(node: SyntaxNode): String? = node
    .children()
    .lastOrNull { it.type == NAME }
    ?.text
