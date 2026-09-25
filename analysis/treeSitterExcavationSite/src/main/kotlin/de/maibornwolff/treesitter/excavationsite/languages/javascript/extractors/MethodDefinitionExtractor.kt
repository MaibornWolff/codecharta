package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DECORATOR
import org.treesitter.TSNode

/**
 * Extracts identifiers from method definition including preceding decorators.
 */
internal fun extractIdentifiersFromMethodDefinition(node: TSNode, sourceCode: String): List<String> {
    val decorators = generateSequence(node.prevSibling) { it.prevSibling }
        // tree-sitter's prevSibling returns a null-node sentinel (not Kotlin null) past the first
        // child, so generateSequence never terminates on its own; the `!it.isNull` guard must come
        // first so `.type` is never evaluated on a null node (which throws TSException).
        .takeWhile { !it.isNull && it.type == DECORATOR }
        .mapNotNull { extractDecoratorName(it, sourceCode) }
        .toList()
        .reversed()
    val propertyName = extractPropertyName(node, sourceCode)
    return decorators + listOfNotNull(propertyName)
}
