package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"
private const val RECORD_PATTERN = "record_pattern"

/**
 * Extracts pattern variable from instanceof: `obj instanceof String str` -> "str"
 *
 * Pattern matching syntax: after the type_identifier, an identifier declares
 * the pattern variable. Returns null if using record patterns.
 */
internal fun extractInstanceofPatternVariable(node: TSNode, sourceCode: String): String? {
    var lastIdentifier: TSNode? = null
    var foundType = false
    for (child in node.children()) {
        when (child.type) {
            TYPE_IDENTIFIER -> foundType = true
            RECORD_PATTERN -> return null
            IDENTIFIER -> if (foundType) lastIdentifier = child
        }
    }
    return lastIdentifier?.let { TreeTraversal.getNodeText(it, sourceCode) }
}
