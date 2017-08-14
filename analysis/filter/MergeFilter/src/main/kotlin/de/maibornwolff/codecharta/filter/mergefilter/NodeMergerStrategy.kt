package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node

interface NodeMergerStrategy {
    fun mergeNodeLists(lists: List<List<Node>>?): List<Node>
}
