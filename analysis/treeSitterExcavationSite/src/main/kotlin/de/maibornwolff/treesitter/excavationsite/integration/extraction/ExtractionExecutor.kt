package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Executes generic extraction strategies to extract text from AST nodes.
 *
 * This executor only handles generic patterns defined in [ExtractionStrategy].
 * Language-specific extraction logic should be handled separately via
 * custom extractors passed to the language's extraction implementation.
 */
object ExtractionExecutor {
    /**
     * Executes an extraction strategy to extract a single identifier from a node.
     */
    fun extractSingle(node: SyntaxNode, method: ExtractionStrategy): String? = when (method) {
        is ExtractionStrategy.FirstChildByType ->
            TreeTraversal.findFirstChildTextByType(node, method.type)

        is ExtractionStrategy.FirstChildByTypes ->
            TreeTraversal.findFirstChildTextByType(node, *method.types.toTypedArray())

        is ExtractionStrategy.NestedInChild ->
            node
                .children()
                .firstOrNull { it.type == method.containerType }
                ?.let { TreeTraversal.findFirstChildTextByType(it, method.targetType) }

        is ExtractionStrategy.AllChildrenByType ->
            TreeTraversal.findFirstChildTextByType(node, method.type)
    }

    /**
     * Executes an extraction strategy to extract multiple identifiers from a node.
     */
    fun extractMultiple(node: SyntaxNode, method: ExtractionStrategy): List<String> = when (method) {
        is ExtractionStrategy.AllChildrenByType ->
            TreeTraversal.findAllChildrenTextByType(node, method.type)

        else -> listOfNotNull(extractSingle(node, method))
    }
}
