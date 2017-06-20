package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node


class NodeMerger() {
    val attributeMerger = AttributeMerger()

    fun mergeNodeLists(lists: List<List<Node>>?): List<Node>? {
        val realNodeList = lists!!.filter { l -> !l.isEmpty() }
        return when (realNodeList.count()) {
            0 -> listOf()
            1 -> realNodeList.first()
            else -> merge(lists.reduce { l1, l2 -> l1.union(l2).toList() })
        }
    }

    private fun mergedListOf(list1: List<Node>?, list2: List<Node>?): List<Node>? {
        return when {
            list1 == null && list2 == null -> listOf()
            list1 == null || list1.isEmpty() -> list2!!
            list2 == null || list2.isEmpty() -> list1
            else -> list1.union(list2).toList()
        }
    }

    fun merge(n1: Node, n2: Node): Node {
         return Node(n1.name, n1.type, attributeMerger.merge(n1.attributes, n2.attributes), "", merge(mergedListOf(n1.children, n2.children)))
    }

    private fun areSameNodes(n1: Node, n2: Node): Boolean {
        return n1.name == n2.name
    }

    fun merge(list: List<Node>?): List<Node>? {
        // precondition:
        if (list == null || list.size <= 1) {
            return list
        }

        /* algorithm:
            1. Sort given list
            2. Check successive nodes for equal id, merge if necessary
            3. Add to merged list
         */
        val mergedList = mutableSetOf<Node>()
        val listWithDuplicates = list.toMutableList()
        listWithDuplicates.sortBy { t -> t.name }

        var nextNode = listWithDuplicates.pop()
        while (!listWithDuplicates.isEmpty()) {
            val actualNode = nextNode
            nextNode = listWithDuplicates.pop()
            if (areSameNodes(actualNode, nextNode)) {
                nextNode = merge(actualNode, nextNode)

            } else {
                mergedList.add(actualNode)
            }
        }
        mergedList.add(nextNode)
        return mergedList.toList()
    }

}

fun <E> MutableList<E>.pop(): E {
    val first = this.first()
    this.remove(first)
    return first
}
