package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val CONSTANT = "constant"
private const val SCOPE_RESOLUTION = "scope_resolution"

/**
 * Extracts identifiers from class/module with potential nested namespaces.
 * For `class Outer::Inner::Deep`, extracts [Outer, Inner, Deep].
 */
internal fun extractFromClassOrModuleMultiple(node: TSNode, sourceCode: String): List<String> {
    val scopeResolution = node.children().firstOrNull {
        it.type == SCOPE_RESOLUTION
    }
    return if (scopeResolution != null) {
        extractConstantsFromScopeResolution(scopeResolution, sourceCode)
    } else {
        listOfNotNull(
            TreeTraversal.findFirstChildTextByType(node, sourceCode, CONSTANT)
        )
    }
}

/**
 * Recursively extracts all constants from a scope_resolution node.
 */
private fun extractConstantsFromScopeResolution(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            SCOPE_RESOLUTION -> extractConstantsFromScopeResolution(child, sourceCode)
            CONSTANT -> listOf(TreeTraversal.getNodeText(child, sourceCode))
            else -> emptyList()
        }
    }.toList()
