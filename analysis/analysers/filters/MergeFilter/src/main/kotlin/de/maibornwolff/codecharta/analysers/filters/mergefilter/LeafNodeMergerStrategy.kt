package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

/**
 * merges leafs according to the level of matching of their paths
 */
class LeafNodeMergerStrategy(
    private val addMisfittingNodes: Boolean,
    ignoreCase: Boolean = false
) : NodeMergerStrategy {
    private val mergeConditionSatisfied: (MutableNode, MutableNode) -> Boolean

    private var nodesProcessed = 0
    private var nodesMerged = 0

    init {
        mergeConditionSatisfied =
            if (ignoreCase) {
                {
                        n1: MutableNode,
                        n2: MutableNode
                    ->
                    n1.name.equals(n2.name, ignoreCase = true)
                }
            } else {
                {
                        n1: MutableNode,
                        n2: MutableNode
                    ->
                    n1.name == n2.name
                }
            }
    }

    override fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode> {
        return if (nodeLists.isEmpty()) {
            listOf()
        } else {
            nodeLists.reduce { mergedNodeList, nextNodeList ->
                nextNodeList.fold(mergedNodeList) {
                        accumulatedNodes: List<MutableNode>,
                        nextNode: MutableNode
                    ->
                    mergeNodeIfExistentInList(accumulatedNodes, nextNode)
                }
            }
        }
    }

    private fun mergeNodeIfExistentInList(accumulatedNodes: List<MutableNode>, nextNode: MutableNode): List<MutableNode> {
        nodesProcessed++
        return accumulatedNodes.map { existingNode ->
            if (mergeConditionSatisfied(existingNode, nextNode)) {
                nodesMerged++
                merge(existingNode, nextNode)
            } else {
                existingNode
            }
        }
    }

    override fun logMergeStats() {
        Logger.info {
            "$nodesProcessed nodes were processed and $nodesMerged were merged"
        }
        if (nodesMerged == 0) {
            Logger.warn {
                "No nodes were merged. Hierarchies may not match up."
            }
        }
    }

    private fun merge(vararg nodes: MutableNode): MutableNode {
        val root = nodes[0].merge(nodes.asList())
        nodes.map {
            it.nodes
        }.reduce { total, next -> total.addAll(next) }.forEach {
            root.insertAt(Path(it.key.edgesList.dropLast(1)), it.value)
        }
        return root
    }

    private fun replaceMisfittingPath(path: Path): Path {
        return when {
            addMisfittingNodes -> path
            else -> Path.TRIVIAL
        }
    }

    private fun Set<Path>.findFittingPathOrNull(path: Path): Path? {
        val matchingLeaf =
            this.filter {
                !it.isTrivial
            }.maxByOrNull {
                path.fittingEdgesFromTailWith(it)
            } ?: path
        return when {
            path.fittingEdgesFromTailWith(matchingLeaf) == 0 -> null
            else -> matchingLeaf
        }
    }

    private fun Map<Path, MutableNode>.addAll(nodes: Map<Path, MutableNode>): Map<Path, MutableNode> {
        val newNodes =
            nodes.filterValues {
                it.isLeaf
            }.mapKeys {
                this.keys.findFittingPathOrNull(it.key) ?: replaceMisfittingPath(it.key)
            }.filterKeys {
                !it.isTrivial
            }
        val unchangedNodes =
            this.filterValues {
                it.isLeaf
            }.filterKeys {
                !newNodes.keys.contains(it)
            }

        return newNodes.plus(unchangedNodes).mapValues {
            val tempNode = this[it.key]
            if (tempNode == null) it.value else it.value.merge(listOf(tempNode))
        }
    }
}
