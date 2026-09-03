package de.maibornwolff.codecharta.model

/**
 * How a restructuring action re-paths a node: it takes the node's path segments as they were before and
 * returns the segments the node now sits on, or null when the node did not survive the restructuring.
 */
typealias SegmentRemapping = (List<String>) -> List<String>?

/**
 * The domain vocabulary of a project: for every node, the words its code uses. Keyed by node id, so a
 * filter that re-paths the tree has to re-key the lens along with it — see [rekeyed].
 */
data class DomainLens(val nodes: Map<String, DomainNode> = emptyMap()) : Lens {
    val carriesData: Boolean get() = nodes.isNotEmpty()

    /**
     * Union both lenses by node id. A node only one input describes is carried over untouched — there is
     * nothing to reconcile, so its producer's word order survives. A node both describe keeps, per word,
     * the higher frequency and the higher tfidf independently, the way [NodeMaxAttributeMerger] reconciles
     * a metric two inputs measured.
     */
    fun merge(other: DomainLens): DomainLens {
        if (nodes.isEmpty()) return other
        if (other.nodes.isEmpty()) return this

        val merged = LinkedHashMap(nodes)
        other.nodes.forEach { (nodeId, node) ->
            val existing = merged[nodeId]
            merged[nodeId] = if (existing == null) node else existing.merge(node)
        }
        return DomainLens(merged)
    }

    /**
     * Re-key the lens onto a restructured tree. A node id is a hash of the node's canonical path and
     * cannot be reversed into it, so the tree as it was *before* the restructuring is walked to recover
     * which path each id stood for; [remapSegments] then maps that path the way the restructuring moved
     * the node, and the entry is re-keyed under the id the node now has. A node that did not survive
     * maps to null and its entry is dropped, so no key is left pointing at nothing.
     */
    fun rekeyed(treeBeforeRestructuring: Node, remapSegments: SegmentRemapping): DomainLens {
        if (nodes.isEmpty()) return this

        val newIdByOldId = mutableMapOf<String, String>()
        collectIdMapping(treeBeforeRestructuring, emptyList(), remapSegments, newIdByOldId)

        val rekeyedNodes = LinkedHashMap<String, DomainNode>()
        nodes.forEach { (oldId, node) ->
            val newId = newIdByOldId[oldId] ?: return@forEach
            // A move can land a node on a path that already had an entry; the tree keeps the node that
            // was already there, so its entry wins here too.
            rekeyedNodes.putIfAbsent(newId, node)
        }
        return DomainLens(rekeyedNodes)
    }

    // The root node carries no segment of its own, matching how ProjectToCcJsonV2Mapper assigns ids.
    private fun collectIdMapping(node: Node, segments: List<String>, remapSegments: SegmentRemapping, mapping: MutableMap<String, String>) {
        val type = node.type ?: NodeType.File
        remapSegments(segments)?.let { newSegments ->
            mapping[NodeId.fromSegments(segments, type)] = NodeId.fromSegments(newSegments, type)
        }
        node.children.forEach { child -> collectIdMapping(child, segments + child.name, remapSegments, mapping) }
    }
}

data class DomainNode(val words: List<DomainWord> = emptyList()) {
    fun merge(other: DomainNode): DomainNode {
        val mergedWords = LinkedHashMap<String, DomainWord>()
        (words + other.words).forEach { word ->
            val existing = mergedWords[word.text]
            mergedWords[word.text] = if (existing == null) word else existing.merge(word)
        }
        // Strongest first, ties alphabetically, so a merge of the same inputs always reads the same.
        return DomainNode(mergedWords.values.sortedWith(compareByDescending<DomainWord> { it.frequency }.thenBy { it.text }))
    }
}

data class DomainWord(val text: String, val frequency: Int, val tfidf: Double? = null) {
    fun merge(other: DomainWord): DomainWord = DomainWord(
        text = text,
        frequency = maxOf(frequency, other.frequency),
        // A word only one input scored keeps that score rather than losing it to the unscored side.
        tfidf = listOfNotNull(tfidf, other.tfidf).maxOrNull()
    )
}
