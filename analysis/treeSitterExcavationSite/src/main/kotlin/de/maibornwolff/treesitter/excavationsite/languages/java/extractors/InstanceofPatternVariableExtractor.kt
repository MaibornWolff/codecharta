package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"
private const val RECORD_PATTERN = "record_pattern"

/**
 * Extracts pattern variable from instanceof: `obj instanceof String str` -> "str"
 *
 * Pattern matching syntax: after the type_identifier, an identifier declares
 * the pattern variable. Returns null if using record patterns.
 */
internal fun extractInstanceofPatternVariable(node: SyntaxNode): String? {
    var lastIdentifier: SyntaxNode? = null
    var foundType = false
    for (child in node.children()) {
        when (child.type) {
            TYPE_IDENTIFIER -> foundType = true
            RECORD_PATTERN -> return null
            IDENTIFIER -> if (foundType) lastIdentifier = child
        }
    }
    return lastIdentifier?.text
}
