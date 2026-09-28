package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.CALL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts decorator name from a decorator node.
 * Handles both simple decorators (@Decorator) and call expression decorators (@Decorator()).
 */
internal fun extractDecoratorName(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER -> {
                return TreeTraversal.getNodeText(child, sourceCode)
            }
            CALL_EXPRESSION -> {
                TreeTraversal
                    .findFirstChildTextByType(
                        child,
                        sourceCode,
                        IDENTIFIER
                    )?.let { return it }
            }
        }
    }
    return null
}
