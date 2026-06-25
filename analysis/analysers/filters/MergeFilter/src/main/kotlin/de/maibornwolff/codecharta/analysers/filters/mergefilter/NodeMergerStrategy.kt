package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode

interface NodeMergerStrategy {
    /** Whether this strategy merges edges across all inputs (union) or keeps only the reference's edges (overlay). */
    val mergesEdges: Boolean

    fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode>

    fun logMergeStats()
}
