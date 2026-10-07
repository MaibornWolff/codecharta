package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val CONST_ELEMENT = "const_element"
private const val NAME = "name"

/**
 * Extracts constant name from const_element child.
 * Example: `const MAX_SIZE = 100;` -> "MAX_SIZE"
 */
internal fun extractConstName(node: SyntaxNode): String? = node
    .children()
    .firstOrNull { it.type == CONST_ELEMENT }
    ?.let { findFirstChildTextByType(it, NAME) }
