package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val FIELD_DESIGNATOR = "field_designator"
private const val FIELD_IDENTIFIER = "field_identifier"

/**
 * Extracts field name from designated initializer.
 * Example: .x = 10 extracts "x"
 */
internal fun extractFromInitializerPair(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        if (child.type == FIELD_DESIGNATOR) {
            return TreeTraversal.findFirstChildTextByType(
                child,
                sourceCode,
                FIELD_IDENTIFIER
            )
        }
    }
    return null
}
