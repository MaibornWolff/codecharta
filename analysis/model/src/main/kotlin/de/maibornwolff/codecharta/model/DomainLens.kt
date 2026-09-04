package de.maibornwolff.codecharta.model

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

    /** Re-key the lens onto a restructured tree; see [nodeIdRemapping] for how ids are recovered. */
    fun rekeyed(treeBeforeRestructuring: Node, remapSegments: SegmentRemapping): DomainLens {
        if (nodes.isEmpty()) return this
        return DomainLens(nodes.rekeyedBy(nodeIdRemapping(treeBeforeRestructuring, remapSegments)))
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
