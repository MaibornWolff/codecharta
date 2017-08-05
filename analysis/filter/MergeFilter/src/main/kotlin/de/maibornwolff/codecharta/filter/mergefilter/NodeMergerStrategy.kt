package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node

interface NodeMergerStrategy {
    val mergeConditionSatisfied: (Node, Node) -> Boolean
    fun mergeNodeLists(lists: List<List<Node>>?): List<Node>
}