package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.util.NullableMapMerger


class NodeMerger {
    val nullableMapMerger = NullableMapMerger<String>()

    fun mergeNodeLists(lists: List<List<Node>>?): List<Node>? {
        val realNodeList = lists!!.filter { l -> !l.isEmpty() }
        return merge(realNodeList.flatten())
    }

    private fun mergedListOf(list1: List<Node>?, list2: List<Node>?): List<Node> {
        return when {
            list1 == null -> list2 ?: listOf()
            list2 == null -> list1
            else -> list1.union(list2).toList()
        }
    }

    fun merge(n1: Node, n2: Node): Node {
        return Node(
                n1.name,
                n1.type,
                nullableMapMerger.merge(n1.attributes, n2.attributes),
                mergeLink(n1.link, n2.link),
                merge(mergedListOf(n1.children, n2.children)))
    }

    private fun  mergeLink(link1: String?, link2: String?): String? {
        return when {
            link1 == link2 -> link1
            link1 == null -> link2
            link2 == null -> link1
            else -> null
        }
    }

    private fun areSameNodes(n1: Node, n2: Node): Boolean {
        return n1.name == n2.name
    }

    fun merge(list: List<Node>): List<Node>? {
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

        var nextNode = listWithDuplicates.removeAt(0)
        while (!listWithDuplicates.isEmpty()) {
            val actualNode = nextNode
            nextNode = listWithDuplicates.removeAt(0)
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
