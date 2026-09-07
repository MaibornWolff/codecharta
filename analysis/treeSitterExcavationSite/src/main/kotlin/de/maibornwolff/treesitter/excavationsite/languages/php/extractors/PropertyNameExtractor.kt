package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val PROPERTY_ELEMENT = "property_element"

/**
 * Extracts property name from property_element child.
 * Example: `private $count = 0;` -> "count"
 */
internal fun extractPropertyName(node: TSNode, sourceCode: String): String? = node
    .children()
    .firstOrNull { it.type == PROPERTY_ELEMENT }
    ?.let { findFirstVariableName(it, sourceCode) }
