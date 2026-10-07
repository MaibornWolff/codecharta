package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val PROPERTY_ELEMENT = "property_element"

/**
 * Extracts property name from property_element child.
 * Example: `private $count = 0;` -> "count"
 */
internal fun extractPropertyName(node: SyntaxNode): String? = node
    .children()
    .firstOrNull { it.type == PROPERTY_ELEMENT }
    ?.let { findFirstVariableName(it) }
