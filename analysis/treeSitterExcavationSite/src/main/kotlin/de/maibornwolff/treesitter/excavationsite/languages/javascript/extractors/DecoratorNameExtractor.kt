package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.CALL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Extracts decorator name from a decorator node.
 * Handles both simple decorators (@Decorator) and call expression decorators (@Decorator()).
 */
internal fun extractDecoratorName(node: SyntaxNode): String? {
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER -> {
                return child.text
            }
            CALL_EXPRESSION -> {
                TreeTraversal
                    .findFirstChildTextByType(
                        child,
                        IDENTIFIER
                    )?.let { return it }
            }
        }
    }
    return null
}
