package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.util.Logger

/**
 * Merges nodes whose tree positions coincide and keeps every other node — the same-rooting union.
 * Construct through [MergeResolverStrategy.recursive].
 */
internal class UnionMergeResolver(ignoreCase: Boolean) : MergeResolverStrategy(ignoreCase) {
    override fun mergeNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode> {
        val matchCount = nodeList.count { nodesMatch(it, node) }
        if (matchCount == 0) {
            return nodeList + node
        }
        if (matchCount > 1) {
            warnAmbiguousMatch(node, matchCount)
            return nodeList + node
        }
        nodesMerged++
        return nodeList.map { if (nodesMatch(it, node)) mergeRecursively(it, node) else it }
    }

    override fun statsMessage(): String {
        val added = nodesProcessed - nodesMerged
        return "$nodesProcessed nodes were processed, $added were added and $nodesMerged were merged"
    }

    // A File and a Folder that share a name are genuinely distinct nodes — they own distinct 2.0 ids, so
    // merging them would flip one's type (NodeMaxAttributeMerger.createType prefers File) or, if both were
    // kept, collide at the writer's duplicate-id guard. Refuse only that clash; every other pairing (equal
    // types, or a type that is neither File nor Folder acting as a wildcard) merges by name as before.
    private fun nodesMatch(first: MutableNode, second: MutableNode): Boolean =
        namesMatch(first.name, second.name) && !isFileFolderClash(first.type, second.type)

    private fun isFileFolderClash(first: NodeType?, second: NodeType?): Boolean =
        (first == NodeType.File && second == NodeType.Folder) || (first == NodeType.Folder && second == NodeType.File)

    // [nodesMatch] is not transitive: a node whose type is neither File nor Folder acts as a wildcard, so
    // it matches a same-named File *and* a same-named Folder — a pair the clash guard above deliberately
    // keeps apart as siblings. Merging into every match would copy the incoming attributes and children
    // onto both. Append the node instead, the same "skipped, never guessed" rule OVERLAY applies to
    // ambiguous content and suffix matches. The appended node keeps its own type and therefore its own id.
    private fun warnAmbiguousMatch(node: MutableNode, matchCount: Int) {
        Logger.warn {
            "Node '${node.name}' of type ${node.type} matches $matchCount same-named nodes of differing types; " +
                "keeping it as a separate node instead of merging it into any of them."
        }
    }

    private fun mergeRecursively(reference: MutableNode, incoming: MutableNode): MutableNode {
        val merged = reference.merge(listOf(incoming))
        merged.children.addAll(mergeNodeLists(listOf(reference.children.toList(), incoming.children.toList())))
        return merged
    }
}
