package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

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
    fun extractSingle(node: TSNode, sourceCode: String, method: ExtractionStrategy): String? = when (method) {
        is ExtractionStrategy.FirstChildByType ->
            TreeTraversal.findFirstChildTextByType(node, sourceCode, method.type)

        is ExtractionStrategy.FirstChildByTypes ->
            TreeTraversal.findFirstChildTextByType(node, sourceCode, *method.types.toTypedArray())

        is ExtractionStrategy.NestedInChild ->
            node
                .children()
                .firstOrNull { it.type == method.containerType }
                ?.let { TreeTraversal.findFirstChildTextByType(it, sourceCode, method.targetType) }

        is ExtractionStrategy.AllChildrenByType ->
            TreeTraversal.findFirstChildTextByType(node, sourceCode, method.type)
    }

    /**
     * Executes an extraction strategy to extract multiple identifiers from a node.
     */
    fun extractMultiple(node: TSNode, sourceCode: String, method: ExtractionStrategy): List<String> = when (method) {
        is ExtractionStrategy.AllChildrenByType ->
            TreeTraversal.findAllChildrenTextByType(node, sourceCode, method.type)

        else -> listOfNotNull(extractSingle(node, sourceCode, method))
    }
}
