package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val FIELD_DESIGNATOR = "field_designator"
private const val FIELD_IDENTIFIER = "field_identifier"

/**
 * Extracts field name from designated initializer.
 * Example: .x = 10 extracts "x"
 */
internal fun extractFromInitializerPair(node: SyntaxNode): String? {
    for (child in node.children()) {
        if (child.type == FIELD_DESIGNATOR) {
            return TreeTraversal.findFirstChildTextByType(
                child,
                FIELD_IDENTIFIER
            )
        }
    }
    return null
}
