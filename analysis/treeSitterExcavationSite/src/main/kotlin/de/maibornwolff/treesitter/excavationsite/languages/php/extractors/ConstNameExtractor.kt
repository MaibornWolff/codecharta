package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val CONST_ELEMENT = "const_element"
private const val NAME = "name"

/**
 * Extracts constant name from const_element child.
 * Example: `const MAX_SIZE = 100;` -> "MAX_SIZE"
 */
internal fun extractConstName(node: TSNode, sourceCode: String): String? = node
    .children()
    .firstOrNull { it.type == CONST_ELEMENT }
    ?.let { findFirstChildTextByType(it, sourceCode, NAME) }
