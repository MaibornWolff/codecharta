package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val VARIABLE_NAME = "variable_name"
private const val BY_REF = "by_ref"
private const val PAIR = "pair"

/**
 * Recursively collects all variable names from a node.
 * Used for:
 * - Pairs: `foreach ($items as $key => $value)`
 * - Closure use clauses: `function() use ($x, $y)`
 * - List destructuring: `list($a, $b) = [1, 2]`
 */
internal fun collectVariables(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            VARIABLE_NAME ->
                listOf(stripDollarPrefix(TreeTraversal.getNodeText(child, sourceCode)))
            BY_REF ->
                listOfNotNull(findFirstVariableName(child, sourceCode))
            PAIR ->
                collectVariables(child, sourceCode)
            else -> emptyList()
        }
    }.toList()
