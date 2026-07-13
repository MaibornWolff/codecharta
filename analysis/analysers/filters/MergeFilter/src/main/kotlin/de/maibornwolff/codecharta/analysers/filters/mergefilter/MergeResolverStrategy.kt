package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

sealed class MergeResolverStrategy(protected val ignoreCase: Boolean) : NodeMergerStrategy {
    protected var nodesProcessed = 0
    protected var nodesMerged = 0

    final override fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode> {
        if (nodeLists.isEmpty()) return listOf()
        return nodeLists.reduce { mergedNodeList, nextNodeList ->
            nextNodeList.fold(mergedNodeList) { accumulatedNodes, nextNode ->
                nodesProcessed++
                mergeNode(accumulatedNodes, nextNode)
            }
        }
    }

    protected abstract fun mergeNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode>

    protected abstract fun statsMessage(): String

    final override fun logMergeStats() {
        Logger.info { statsMessage() }
        if (nodesMerged == 0) {
            Logger.warn { "No nodes were merged. Hierarchies may not match up." }
        }
    }

    // NFC-normalize before comparing so NFD (macOS) and NFC (Linux/git) spellings hash to the same node.
    // When ignoreCase, fold via uppercaseChar().lowercaseChar() — String.lowercase() is locale-aware and
    // can change string length ("İ"), so it disagrees with equals(ignoreCase) on the names that matter.
    protected fun foldedName(name: String): String {
        val normalized = NodeId.normalizeName(name)
        return if (ignoreCase) normalized.map { it.uppercaseChar().lowercaseChar() }.joinToString("") else normalized
    }

    protected fun foldedEdges(path: Path): List<String> = path.edgesList.map { foldedName(it) }

    protected fun namesMatch(first: String, second: String): Boolean = foldedName(first) == foldedName(second)

    companion object {
        fun recursive(ignoreCase: Boolean = false): MergeResolverStrategy = UnionMergeResolver(ignoreCase)

        fun leaf(addUnmatchedNodes: Boolean, ignoreCase: Boolean = false): MergeResolverStrategy =
            OverlayMergeResolver(addUnmatchedNodes, ignoreCase)
    }
}
