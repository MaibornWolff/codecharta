package de.maibornwolff.codecharta.model

/**
 * How a restructuring action re-paths a node: it takes the node's path segments as they were before and
 * returns the segments the node now sits on, or null when the node did not survive the restructuring.
 */
typealias SegmentRemapping = (List<String>) -> List<String>?

/**
 * Map every node id in [treeBeforeRestructuring] to the id the node has in [treeAfterRestructuring]
 * after [remapSegments] moved it.
 *
 * A node id is a hash of the node's canonical path and cannot be reversed into it, so the tree as it was
 * *before* the restructuring is walked to recover which path each id stood for. A node that did not
 * survive is absent from the result, so a lens keyed by node id can drop its entry rather than leave a
 * key pointing at nothing. Survival is checked against the restructured tree itself, not only against
 * the remapping: a folder the move emptied keeps its path but is pruned, so its id is gone too. A file
 * moved onto a file that stayed where it was did not survive either: the tree keeps the one already there.
 */
fun nodeIdRemapping(treeBeforeRestructuring: Node, treeAfterRestructuring: Node, remapSegments: SegmentRemapping): Map<String, String> {
    val remappedNodes = mutableListOf<RemappedNode>()
    collectRemappedNodes(treeBeforeRestructuring, emptyList(), remapSegments, remappedNodes)
    val survivingIds = HashSet<String>()
    collectIds(treeAfterRestructuring, emptyList(), survivingIds)
    val idsLeftInPlace = remappedNodes.filterNot { it.isMoved }.mapTo(HashSet()) { it.newId }
    return remappedNodes
        .filter { it.newId in survivingIds && !(it.isFile && it.isMoved && it.newId in idsLeftInPlace) }
        .associate { it.oldId to it.newId }
}

private class RemappedNode(val oldId: String, val newId: String, val isFile: Boolean) {
    val isMoved: Boolean get() = oldId != newId
}

private fun collectIds(node: Node, segments: List<String>, into: MutableSet<String>) {
    into.add(NodeId.fromSegments(segments, node.type ?: NodeType.File))
    node.children.forEach { child -> collectIds(child, segments + child.name, into) }
}

// The root node carries no segment of its own, matching how ProjectToCcJsonV2Mapper assigns ids.
private fun collectRemappedNodes(node: Node, segments: List<String>, remapSegments: SegmentRemapping, into: MutableList<RemappedNode>) {
    val type = node.type ?: NodeType.File
    remapSegments(segments)?.let { newSegments ->
        into.add(RemappedNode(NodeId.fromSegments(segments, type), NodeId.fromSegments(newSegments, type), type == NodeType.File))
    }
    node.children.forEach { child -> collectRemappedNodes(child, segments + child.name, remapSegments, into) }
}

/**
 * Re-key a lens's per-node entries onto a restructured tree, dropping entries whose node did not survive.
 * A move can land a folder on a path that already had an entry; the tree keeps the folder that was already
 * there, so its entry wins here too.
 */
internal fun <T> Map<String, T>.rekeyedBy(newIdByOldId: Map<String, String>): Map<String, T> {
    val rekeyed = LinkedHashMap<String, T>()
    forEach { (oldId, entry) ->
        val newId = newIdByOldId[oldId] ?: return@forEach
        if (newId == oldId) rekeyed[newId] = entry else rekeyed.putIfAbsent(newId, entry)
    }
    return rekeyed
}
