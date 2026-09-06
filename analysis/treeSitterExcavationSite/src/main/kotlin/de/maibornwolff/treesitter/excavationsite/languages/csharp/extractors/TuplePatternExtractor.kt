package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val TUPLE_PATTERN = "tuple_pattern"

/**
 * Extracts all variables from tuple pattern: `var (x, y, z)` or nested `var (a, (b, c))`
 *
 * Recursively collects all identifiers from nested tuple patterns.
 */
internal fun extractAllTuplePatternVariables(node: TSNode, sourceCode: String): List<String> =
    collectTuplePatternVariables(node, sourceCode)

private fun collectTuplePatternVariables(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            IDENTIFIER ->
                listOf(TreeTraversal.getNodeText(child, sourceCode))
            TUPLE_PATTERN ->
                collectTuplePatternVariables(child, sourceCode)
            else -> emptyList()
        }
    }.toList()
