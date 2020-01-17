package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import mu.KotlinLogging

/**
 * merges nodes recursively if their paths coincide
 */
class RecursiveNodeMergerStrategy(ignoreCase: Boolean = false): NodeMergerStrategy {

    private val mergeConditionSatisfied: (MutableNode, MutableNode) -> Boolean

    private var nodesProcessed = 0
    private var nodesMerged = 0

    private val logger = KotlinLogging.logger { }

    init {
        mergeConditionSatisfied =
                if (ignoreCase) { n1: MutableNode, n2: MutableNode -> n1.name.toUpperCase() == n2.name.toUpperCase() }
                else { n1: MutableNode, n2: MutableNode -> n1.name == n2.name }
    }

    override fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode> {
        if (nodeLists.isEmpty()) return listOf()

        return nodeLists.reduce { mergedNodeList, nextNodeList ->
            nextNodeList.fold(mergedNodeList, { accumulatedNodes: List<MutableNode>, nextNode: MutableNode ->
                nodesProcessed++
                mergeOrAppendNode(accumulatedNodes, nextNode)
            })

        }
    }

    private fun mergeOrAppendNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode> {
        if (nodeList.filter { mergeConditionSatisfied(it, node) }.isEmpty()) {
            return nodeList + node
        }

        nodesMerged++
        return nodeList.map {
            if (mergeConditionSatisfied(it, node)) {
                merge(it, node)
            } else {
                it
            }
        }
    }

    override fun logMergeStats() {
        logger.info("$nodesProcessed nodes were processed, ${nodesProcessed - nodesMerged} were added and $nodesMerged were merged")
        if (nodesMerged == 0) logger.warn("No nodes were merged. Hierarchies may not match up.")
    }

    private fun merge(vararg nodes: MutableNode): MutableNode {
        val node = nodes[0].merge(nodes.toList())
        node.children.addAll(this.mergeNodeLists(nodes.map { it.children }))
        return node
    }
}
