package de.maibornwolff.codecharta.model

/**
 * How a restructuring action re-paths a node: it takes the node's path segments as they were before and
 * returns the segments the node now sits on, or null when the node did not survive the restructuring.
 */
typealias SegmentRemapping = (List<String>) -> List<String>?

/**
 * Map every node id in [treeBeforeRestructuring] to the id the node has after [remapSegments] moved it.
 *
 * A node id is a hash of the node's canonical path and cannot be reversed into it, so the tree as it was
 * *before* the restructuring is walked to recover which path each id stood for. A node that did not
 * survive is absent from the result, so a lens keyed by node id can drop its entry rather than leave a
 * key pointing at nothing.
 */
fun nodeIdRemapping(treeBeforeRestructuring: Node, remapSegments: SegmentRemapping): Map<String, String> {
    val newIdByOldId = mutableMapOf<String, String>()
    collectIdMapping(treeBeforeRestructuring, emptyList(), remapSegments, newIdByOldId)
    return newIdByOldId
}

// The root node carries no segment of its own, matching how ProjectToCcJsonV2Mapper assigns ids.
private fun collectIdMapping(node: Node, segments: List<String>, remapSegments: SegmentRemapping, mapping: MutableMap<String, String>) {
    val type = node.type ?: NodeType.File
    remapSegments(segments)?.let { newSegments ->
        mapping[NodeId.fromSegments(segments, type)] = NodeId.fromSegments(newSegments, type)
    }
    node.children.forEach { child -> collectIdMapping(child, segments + child.name, remapSegments, mapping) }
}

/**
 * Re-key a lens's per-node entries onto a restructured tree, dropping entries whose node did not survive.
 * A move can land a node on a path that already had an entry; the tree keeps the node that was already
 * there, so its entry wins here too.
 */
internal fun <T> Map<String, T>.rekeyedBy(newIdByOldId: Map<String, String>): Map<String, T> {
    val rekeyed = LinkedHashMap<String, T>()
    forEach { (oldId, entry) ->
        val newId = newIdByOldId[oldId] ?: return@forEach
        rekeyed.putIfAbsent(newId, entry)
    }
    return rekeyed
}
