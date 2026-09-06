package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val CONSTANT = "constant"
private const val SCOPE_RESOLUTION = "scope_resolution"

/**
 * Extracts class/module name, skipping if using scope resolution (::).
 * Scope resolution is handled by the multi-identifier extractor.
 */
internal fun extractFromClassOrModule(node: TSNode, sourceCode: String): String? =
    if (node.children().any { it.type == SCOPE_RESOLUTION }) {
        null
    } else {
        TreeTraversal.findFirstChildTextByType(node, sourceCode, CONSTANT)
    }
