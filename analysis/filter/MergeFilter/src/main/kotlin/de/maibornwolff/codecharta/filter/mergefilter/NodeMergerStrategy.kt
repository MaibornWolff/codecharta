package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.MutableNode

interface NodeMergerStrategy {
    fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode>
    fun logMergeStats()
}
