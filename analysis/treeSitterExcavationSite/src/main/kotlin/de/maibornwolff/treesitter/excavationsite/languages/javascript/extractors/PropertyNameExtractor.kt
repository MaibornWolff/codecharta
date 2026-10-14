package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val PRIVATE_PROPERTY_IDENTIFIER = "private_property_identifier"
private const val CONSTRUCTOR = "constructor"

/**
 * Extracts property name from field definitions, handling private # prefix.
 * Skips 'constructor' as it's a keyword, not a meaningful identifier.
 */
internal fun extractPropertyName(node: SyntaxNode): String? {
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER,
            PROPERTY_IDENTIFIER -> {
                val name = child.text
                if (name == CONSTRUCTOR) return null
                return name
            }
            PRIVATE_PROPERTY_IDENTIFIER -> {
                return child.text.removePrefix("#")
            }
        }
    }
    return null
}
